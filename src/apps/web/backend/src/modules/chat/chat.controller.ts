import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Sse,
  UseGuards, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { MessageEvent } from '@nestjs/common/interfaces';
import { ChatService } from './chat.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { AiProxyService, type InferenceMessage } from '../../shared/ai-proxy/ai-proxy.service.js';

interface ChatCitation {
  id: string;
  documentId: string;
  documentTitle: string;
  collectionId?: string;
  collectionName?: string;
  page?: number;
  section?: string;
  snippet: string;
  text?: string;
  score: number;
}

interface StreamFrame {
  delta?: string;
  done?: boolean;
  type?: string;
  message?: unknown;
  citations?: ChatCitation[];
}

function toMessageEvent(payload: StreamFrame): MessageEvent {
  return { data: JSON.stringify(payload) };
}

const SOURCE_CONTEXT_SYSTEM_ROLE = 'The document(s) below are the user\'s attached context and the question refers to them. Answer based on the content of these sources and reference them as [1], [2], etc. Even if a source is partial, use what it says and mention it is an excerpt. Do not claim you cannot see or access the attachment, and do not ask the user to upload it again. If the user asks for the document\'s section headings or titles, list only actual section headings found in the sources, never bibliography or reference entries.' as const;

const MAX_HISTORY_MESSAGES = 12;

const REFUSAL_PATTERN =
  /(?:i'?m sorry|unable (?:to )?(?:access|see|view)|cannot access|can'?t (?:access|see|view)|view (?:files|the file)|attached to your message)/i;

const HEADINGS_QUESTION_PATTERN =
  /(?:main\s+)?titles?\s+of|headings?\b|section\s+(?:titles?|headings?|names?)|list\s+the\s+(?:main\s+)?(?:titles?|headings?|sections?)/i;

@Controller('chat/conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chat: ChatService,
    private ai: AiProxyService,
  ) {}

  @Get()
  list(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('query') query?: string,
  ) {
    return this.chat.findAllConversations(user.id, { page, pageSize, query });
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() body: { title?: string; model?: string; projectId?: string },
  ) {
    return this.chat.createConversation(user.id, body);
  }

  @Get(':id')
  get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.chat.findConversationById(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() patch: Record<string, unknown>,
  ) {
    return this.chat.updateConversation(id, user.id, patch);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.chat.deleteConversation(id, user.id);
  }

  @Get(':id/messages')
  messages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.chat.getMessages(id, user.id);
  }

  @Post(':id/messages')
  async postMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Body() body: { content: string; model?: string; documentIds?: string[] },
  ) {
    const conv = await this.chat.findConversationById(id, user.id);
    const model = body.model ?? conv.model;

    const userMessage = await this.chat.saveMessage(id, user.id, {
      role: 'user',
      content: body.content,
      model,
    });

const priorMessages = await this.chat.getMessages(id, user.id);
      const history = this.sanitizeHistory(priorMessages);

    let assistantContent = '';
    const headings = await this.tryHeadingsAnswer(body.content, body.documentIds);
    const citations = headings
      ? headings.citations
      : await this.retrieveSources(body.content, 8, body.documentIds);
    try {
      if (!headings) {
        const completion = await this.ai.chatCompletion(
          this.withSourceContext(history, citations),
          model,
        );
        assistantContent = completion.content ?? '';
      } else {
        assistantContent = headings.content;
      }
    } catch {
      assistantContent = '';
    }

    const assistantMessage = await this.chat.saveMessage(id, user.id, {
      role: 'assistant',
      content: assistantContent,
      model,
      citations,
    });
    return { userMessage, assistantMessage };
  }

  @Sse(':id/stream')
  stream(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Query('content') content: string,
    @Query('model') model?: string,
    @Query('documentIds') documentIds?: string,
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      void (async () => {
        try {
          const conv = await this.chat.findConversationById(id, user.id);
          const useModel = model ?? conv.model;

          const userMessage = await this.chat.saveMessage(id, user.id, {
            role: 'user',
            content,
            model: useModel,
          });
          subscriber.next(toMessageEvent({ type: 'message_saved', message: userMessage }));

const priorMessages = await this.chat.getMessages(id, user.id);
          const history = this.sanitizeHistory(priorMessages);

          const streamIds = documentIds ? documentIds.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
          const headings = await this.tryHeadingsAnswer(content, streamIds);
          const citations = headings
            ? headings.citations
            : await this.retrieveSources(
                content,
                8,
                streamIds,
              );

          let assistantContent = '';
          if (headings) {
            assistantContent = headings.content;
            subscriber.next(toMessageEvent({ delta: assistantContent, done: false }));
            subscriber.next(toMessageEvent({ delta: '', done: true, citations }));
          } else {
            const stream$ = this.ai.streamChatCompletion(this.withSourceContext(history, citations), useModel);
            await new Promise<void>((resolve, reject) => {
              const sub = stream$.subscribe({
                next: ({ content: delta, done }) => {
                  if (delta) {
                    assistantContent += delta;
                    subscriber.next(toMessageEvent({ delta, done: false }));
                  }
                  if (done) {
                    subscriber.next(toMessageEvent({ delta: '', done: true, citations }));
                    sub.unsubscribe();
                    resolve();
                  }
                },
                error: (err: unknown) => {
                  sub.unsubscribe();
                  reject(err);
                },
                complete: () => {
                  if (!assistantContent.length) {
                    subscriber.next(toMessageEvent({ delta: '', done: true }));
                  }
                  resolve();
                },
              });
            });
          }

          if (assistantContent) {
            const assistantMessage = await this.chat.saveMessage(id, user.id, {
              role: 'assistant',
              content: assistantContent,
              model: useModel,
              citations,
            });
            subscriber.next(toMessageEvent({ type: 'assistant_saved', message: assistantMessage }));
          }

          subscriber.complete();
        } catch (err: unknown) {
          subscriber.error(err);
        }
      })();
    }).pipe(map((evt: MessageEvent): MessageEvent => evt));
  }

  private async tryHeadingsAnswer(
    query: string,
    documentIds?: string[],
  ): Promise<{ content: string; citations: ChatCitation[] } | null> {
    if (!HEADINGS_QUESTION_PATTERN.test(query)) return null;
    const ids = documentIds?.filter(Boolean);
    if (!ids?.length) return null;
    try {
      const { documents } = await this.ai.listSections(ids);
      const headings = documents.flatMap((d) => d.titles);
      if (!headings.length) return null;
      const deduped = [...new Set(headings)];
      const content = `The document contains the following sections:\n\n${deduped.map((h, i) => `${i + 1}. ${h}`).join('\n')}`;
      const citations: ChatCitation[] = documents.flatMap((d, di) =>
        d.titles.map((title, ti) => ({
          id: `heading-${di}-${ti}`,
          documentId: d.documentId,
          documentTitle: d.documentTitle,
          page: 1,
          section: title,
          snippet: title,
          score: 1 - ti * 0.01,
        })),
      );
      return { content, citations };
    } catch {
      return null;
    }
  }

  private async retrieveSources(query: string, topK = 8, documentIds?: string[]): Promise<ChatCitation[]> {
    try {
      // Dense retriever applies document_ids AFTER the global top-k search, so
      // fetch many candidates when scoped to specific documents to survive the post-filter.
      const scoped = documentIds?.length ? documentIds : undefined;
      const candidateK = scoped ? Math.min(Math.max(topK * 8, 64), 100) : topK;
      const { results } = await this.ai.search(
        query,
        candidateK,
        scoped ? { document_ids: documentIds } : undefined,
      );
      const keep = scoped ? Math.max(topK, 16) : topK;
      return results.slice(0, keep).map((r) => ({
        id: r.id,
        documentId: r.documentId,
        documentTitle: r.documentTitle,
        collectionId: r.collectionId,
        collectionName: r.collectionName,
        page: r.pageStart,
        section: r.section ?? r.subsection ?? undefined,
        snippet: r.snippet,
        text: r.text,
        score: r.score,
      }));
    } catch {
      return [];
    }
  }

  private buildSourceContext(citations: ChatCitation[]): InferenceMessage | null {
    if (!citations.length) return null;
    const context = citations
      .map(
        (c, i) =>
          `[${i + 1}] ${c.documentTitle}${c.page ? ` (page ${c.page})` : ''}${c.section ? ` — ${c.section}` : ''}:\n${(c.text ?? c.snippet).slice(0, 2000)}`,
      )
      .join('\n\n');
    return { role: 'system', content: `${SOURCE_CONTEXT_SYSTEM_ROLE}\n\n${context}` };
  }

  private sanitizeHistory(
    priorMessages: { role: string; content: string }[],
  ): InferenceMessage[] {
    return priorMessages
      .map((m) => ({ role: m.role, content: m.content }) as InferenceMessage)
      .filter((m) => !(m.role === 'assistant' && REFUSAL_PATTERN.test(m.content)))
      .slice(-MAX_HISTORY_MESSAGES);
  }

  private withSourceContext(
    history: InferenceMessage[],
    citations: ChatCitation[],
  ): InferenceMessage[] {
    const context = this.buildSourceContext(citations);
    if (!context) return history;
    if (history.length <= 1) return [context, ...history];
    // Place the source context immediately before the current question so the
    // model attends to it right at the generation boundary.
    return [...history.slice(0, -1), context, ...history.slice(-1)];
  }
}
