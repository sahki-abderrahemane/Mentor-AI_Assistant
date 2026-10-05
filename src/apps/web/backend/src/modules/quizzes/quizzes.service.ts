import { Injectable, NotFoundException } from '@nestjs/common';
import { LearningService } from '../learning/learning.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, Question, QuizAttempt, QuizAnswer } from './entities/quiz.entity.js';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz) private quizzes: Repository<Quiz>,
    @InjectRepository(Question) private questions: Repository<Question>,
    @InjectRepository(QuizAttempt) private attempts: Repository<QuizAttempt>,
    @InjectRepository(QuizAnswer) private answers: Repository<QuizAnswer>,
    private learning: LearningService,
  ) {}

  async findAll(params: { page?: number; pageSize?: number; subjectId?: string; status?: string }) {
    const page = params.page ?? 1;
    const pageSize = Math.min(params.pageSize ?? 20, 100);
    const qb = this.quizzes.createQueryBuilder('quiz');
    if (params.subjectId) qb.andWhere('quiz.subjectId = :subjectId', { subjectId: params.subjectId });
    if (params.status) qb.andWhere('quiz.status = :status', { status: params.status });
    const [items, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    const ids = items.map((q) => q.id);
    let withCounts = items;
    if (ids.length > 0) {
      try {
        const counts = await this.questions
          .createQueryBuilder('q')
          .select('q.quizId', 'quizId')
          .addSelect('COUNT(q.id)', 'questionCount')
          .where('q.quizId IN (:...ids)', { ids })
          .groupBy('q.quizId')
          .getRawMany<{ quizId: string; questionCount: string }>();
        const byQuiz = new Map(counts.map((c) => [c.quizId, Number(c.questionCount)]));
        withCounts = items.map((quiz) => ({ ...quiz, questionCount: byQuiz.get(quiz.id) ?? 0 }));
      } catch {
        withCounts = items;
      }
    }
    return { items: withCounts, total, page, pageSize, hasNext: page * pageSize < total, hasPrev: page > 1 };
  }

  async findById(id: string) {
    const quiz = await this.quizzes.findOne({ where: { id }, relations: ['questions'] });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async getQuestions(quizId: string) {
    return this.questions.find({ where: { quizId }, order: { order: 'ASC' } });
  }

  async getAttempts(quizId: string) {
    return this.attempts.find({ where: { quizId }, order: { startedAt: 'DESC' } });
  }

  async submit(userId: string, quizId: string, answers: Array<{ questionId: string; answer: string }>) {
    const quiz = await this.findById(quizId);
    const questions = await this.getQuestions(quizId);

    let score = 0;
    let totalPoints = 0;
    const attemptAnswers: Partial<QuizAnswer>[] = [];

    for (const q of questions) {
      const userAnswer = answers.find((a) => a.questionId === q.id);
      totalPoints += q.points;
      let correct = false;
      if (q.type === 'multiple_choice' && userAnswer) {
        const selectedOption = q.options?.find((o) => o.id === userAnswer.answer);
        correct = selectedOption?.isCorrect ?? false;
      } else if (q.type === 'true_false' && userAnswer) {
        correct = userAnswer.answer.toLowerCase() === (q.correctAnswer ?? '').toLowerCase();
      } else if (q.type === 'short_answer' && userAnswer) {
        correct = userAnswer.answer.trim().toLowerCase() === (q.correctAnswer ?? '').trim().toLowerCase();
      }
      if (correct) score += q.points;
      attemptAnswers.push({
        questionId: q.id,
        answer: userAnswer?.answer ?? '',
        correct,
        pointsEarned: correct ? q.points : 0,
      });
    }

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const attempt = this.attempts.create({
      quizId, userId,
      score, totalPoints,
      percentage,
      passed: percentage >= quiz.passingScore,
      timeSpentSeconds: 0,
      answers: attemptAnswers as QuizAnswer[],
    });
    const saved = await this.attempts.save(attempt);

    // Learning engine: update topic mastery + evaluate achievements.
    try {
      await this.learning.recordQuizResult(userId, quiz.subjectName ?? 'General', Math.round(percentage), percentage >= quiz.passingScore);
      void this.learning.evaluateAchievements(userId);
    } catch {
      // learning side-effects must not fail the submission
    }
    return saved;
  }
}