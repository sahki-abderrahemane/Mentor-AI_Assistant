import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { KnowledgeUnit, Document } from '../documents/entities/document.entity.js';
import { Collection } from '../projects/entities/index.js';
import {
  Quiz, Question, QuestionType,
} from '../quizzes/entities/quiz.entity.js';
import { FlashcardDeck, Flashcard } from '../flashcards/entities/flashcard.entity.js';
import { StudyGuide } from '../learning/entities/learning.entity.js';
import { AiProxyService, InferenceMessage } from '../../shared/ai-proxy/ai-proxy.service.js';

const MAX_SOURCE_CHARS = 12_000;

@Injectable()
export class GenerationService {
  constructor(
    @InjectRepository(KnowledgeUnit) private knowledgeUnits: Repository<KnowledgeUnit>,
    @InjectRepository(Document) private documents: Repository<Document>,
    @InjectRepository(Collection) private collections: Repository<Collection>,
    @InjectRepository(Quiz) private quizzes: Repository<Quiz>,
    @InjectRepository(Question) private questions: Repository<Question>,
    @InjectRepository(FlashcardDeck) private decks: Repository<FlashcardDeck>,
    @InjectRepository(Flashcard) private cards: Repository<Flashcard>,
    @InjectRepository(StudyGuide) private guides: Repository<StudyGuide>,
    private aiProxy: AiProxyService,
  ) {}

  // ── Source retrieval ──────────────────────────────────────────────────────

  /** Resolve a document/collection reference into ordered source text. */
  private async resolveDocumentIds(ref: {
    documentId?: string;
    collectionId?: string;
  }): Promise<{ documentIds: string[]; label: string }> {
    if (ref.documentId) {
      const doc = await this.documents.findOne({ where: { id: ref.documentId } });
      if (!doc) throw new NotFoundException('Document not found');
      return { documentIds: [doc.id], label: doc.title };
    }
    if (ref.collectionId) {
      const col = await this.collections.findOne({ where: { id: ref.collectionId } });
      if (!col) throw new NotFoundException('Collection not found');
      const docs = await this.documents.find({
        where: { collectionId: col.id, status: 'ready' as never },
        select: ['id', 'title'],
      });
      if (docs.length === 0) throw new BadRequestException('Collection has no indexed documents');
      return { documentIds: docs.map((d) => d.id), label: col.name };
    }
    throw new BadRequestException('documentId or collectionId is required');
  }

  private async loadSourceText(documentIds: string[]): Promise<string> {
    const units = await this.knowledgeUnits.find({
      where: { documentId: In(documentIds) },
      order: { unitNumber: 'ASC' },
    });
    if (units.length === 0) {
      throw new BadRequestException(
        'No indexed content found for this source — upload and index a document first',
      );
    }

    let text = '';
    for (const u of units) {
      const heading = u.section ? `\n\n## ${u.section}\n\n` : '\n\n';
      if (text.length + heading.length + u.text.length > MAX_SOURCE_CHARS) break;
      text += heading + u.text;
    }
    return text.trim();
  }

  // ── LLM plumbing ──────────────────────────────────────────────────────────

  private extractJson<T>(raw: string): T {
    let cleaned = raw.trim();
    const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(cleaned);
    if (fence) cleaned = fence[1].trim();
    const start = Math.min(
      ...['[', '{'].map((c) => cleaned.indexOf(c)).filter((i) => i >= 0),
    );
    if (Number.isFinite(start)) cleaned = cleaned.slice(start);
    return JSON.parse(cleaned) as T;
  }

  private async completeJson<T>(system: string, user: string): Promise<T> {
    const messages: InferenceMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ];
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await this.aiProxy.chatCompletion(messages, '');
        return this.extractJson<T>(result.content);
      } catch {
        if (attempt === 1) {
          throw new Error(
            'The model did not return valid JSON. Try again or install a larger instruct model for better results.',
          );
        }
        messages.push({
          role: 'assistant',
          content: 'I will respond with strictly valid JSON only.',
        });
        messages.push({ role: 'user', content: 'Return only the JSON now, no other text.' });
      }
    }
    throw new Error('unreachable');
  }

  // ── Quiz generation ───────────────────────────────────────────────────────

  async generateQuiz(userId: string, dto: {
    documentId?: string;
    collectionId?: string;
    title?: string;
    questionCount?: number;
    types?: Array<'multiple_choice' | 'true_false' | 'short_answer'>;
  }) {
    const { documentIds, label } = await this.resolveDocumentIds(dto);
    const source = await this.loadSourceText(documentIds);
    const count = dto.questionCount ?? 5;
    const types = dto.types?.length ? dto.types : ['multiple_choice', 'true_false'];

    const system =
      'You generate exam questions from study material. Respond with STRICT JSON only — no markdown, no commentary.';
    const user = `Create ${count} quiz questions based ONLY on this material.

Material:
"""${source}"""

Allowed question types: ${types.join(', ')}.
Respond with a JSON array. Each element:
{"type":"multiple_choice|true_false|short_answer","text":"question text","options":[{"id":"a","text":"...","isCorrect":false},...],"correctAnswer":"exact answer for true_false/short_answer","explanation":"why"}

Rules: multiple_choice has exactly 4 options with exactly one isCorrect:true. true_false correctAnswer is "true" or "false". Output nothing except the JSON array.`;

    const parsed = await this.completeJson<Array<{
      type: string;
      text: string;
      options?: Array<{ id: string; text: string; isCorrect: boolean }>;
      correctAnswer?: string;
      explanation?: string;
    }>>(system, user);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Model returned no questions');
    }

    const quiz = await this.quizzes.save(this.quizzes.create({
      title: dto.title ?? `${label} — AI quiz`,
      description: `Auto-generated from "${label}"`,
      subjectName: label,
      userId,
      status: 'published' as never,
    }));

    const rows = parsed.slice(0, count).map((q, i) => ({
      quizId: quiz.id,
      type: (types.includes(q.type as never) ? q.type : 'multiple_choice') as QuestionType,
      text: String(q.text ?? ''),
      options: Array.isArray(q.options) ? q.options : null,
      correctAnswer: q.correctAnswer ?? null,
      explanation: q.explanation ?? null,
      points: 1,
      order: i,
    })).filter((r) => r.text);
    if (rows.length > 0) await this.questions.save(rows as unknown as Question[]);
    return this.quizzes.findOne({ where: { id: quiz.id }, relations: ['questions'] });
  }

  // ── Flashcard generation ──────────────────────────────────────────────────

  async generateFlashcards(userId: string, dto: {
    documentId?: string;
    collectionId?: string;
    name?: string;
    cardCount?: number;
  }) {
    const { documentIds, label } = await this.resolveDocumentIds(dto);
    const source = await this.loadSourceText(documentIds);
    const count = dto.cardCount ?? 10;

    const system =
      'You create flashcards from study material. Respond with STRICT JSON only — no markdown, no commentary.';
    const user = `Create ${count} flashcards based ONLY on this material.

Material:
"""${source}"""

Respond with a JSON array of {"front":"question or term","back":"answer or definition","hint":"optional hint or empty string"}.
Output nothing except the JSON array.`;

    const parsed = await this.completeJson<Array<{ front: string; back: string; hint?: string }>>(
      system, user,
    );
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Model returned no flashcards');
    }

    const deck = await this.decks.save(this.decks.create({
      name: dto.name ?? `${label} — AI deck`,
      description: `Auto-generated from "${label}"`,
      subjectName: label,
      userId,
    }));

    const rows = parsed.slice(0, count).map((c, i) => ({
      deckId: deck.id,
      front: String(c.front ?? ''),
      back: String(c.back ?? ''),
      hint: c.hint ? String(c.hint) : null,
      order: i,
    })).filter((r) => r.front && r.back);
    if (rows.length > 0) await this.cards.save(rows as unknown as Flashcard[]);
    return this.decks.findOne({ where: { id: deck.id }, relations: ['cards'] });
  }

  // ── Study guide generation ────────────────────────────────────────────────

  async generateStudyGuide(userId: string, dto: {
    documentId?: string;
    collectionId?: string;
    title?: string;
  }) {
    const { documentIds, label } = await this.resolveDocumentIds(dto);
    const source = await this.loadSourceText(documentIds);

    const system =
      'You write structured study guides. Respond with markdown only, using ## headings per section.';
    const user = `Write a study guide based ONLY on this material.

Material:
"""${source}"""

Structure it with these ## sections in this exact order: Overview, Key Concepts, Important Details, Summary.
Keep it concise and factual. Use bullet points inside sections.`;

    const result = await this.aiProxy.chatCompletion([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ], '');

    const content = result.content.replace(/```markdown|```/g, '').trim();
    const guide = await this.guides.save(this.guides.create({
      userId,
      title: dto.title ?? `${label} — study guide`,
      content,
      metadata: { generatedFrom: label, documentIds },
      status: 'ready',
      generatedAt: new Date(),
    }));
    return guide;
  }
}
