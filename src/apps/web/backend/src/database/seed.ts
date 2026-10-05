/**
 * Database seed script.
 * Creates admin + demo users, default achievements, and a sample project.
 *
 * Run with: npm run seed
 * Idempotent: safe to re-run; existing rows are skipped.
 */
import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../.env.local') });
loadEnv({ path: resolve(__dirname, '../../.env'), override: false });

import { User, Session, RefreshToken, ApiKey, UserSettings } from '../modules/users/entities/user.entity';
import { Project, ProjectMember, Collection } from '../modules/projects/entities';
import { Document, KnowledgeUnit, DocumentProcessingEvent } from '../modules/documents/entities/document.entity';
import { Conversation, Message, ConversationFolder } from '../modules/chat/entities/chat.entity';
import { Quiz, Question, QuizAttempt, QuizAnswer } from '../modules/quizzes/entities/quiz.entity';
import { FlashcardDeck, Flashcard, FlashcardReview } from '../modules/flashcards/entities/flashcard.entity';
import {
  StudySession, LearningStreak, TopicMastery,
  Achievement, UserAchievement, StudyGuide,
} from '../modules/learning/entities/learning.entity';
import { TrainingJob, Model, Adapter, MergedModel, type ModelStatus } from '../modules/training/entities/training.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { UserRole } from '../common/constants';

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgresql://mentorai:mentorai123@localhost:5432/mentorai',
  entities: [
    User, Session, RefreshToken, ApiKey, UserSettings,
    Project, ProjectMember, Collection,
    Document, KnowledgeUnit, DocumentProcessingEvent,
    Conversation, Message, ConversationFolder,
    Quiz, Question, QuizAttempt, QuizAnswer,
    FlashcardDeck, Flashcard, FlashcardReview,
    StudySession, LearningStreak, TopicMastery, Achievement, UserAchievement, StudyGuide,
    TrainingJob, Model, Adapter, MergedModel,
    Notification,
  ],
  synchronize: false,
  logging: false,
});

async function main() {
  await ds.initialize();
  console.log('Connected to database');

  const userRepo = ds.getRepository(User);
  const userSettingsRepo = ds.getRepository(UserSettings);
  const achievementRepo = ds.getRepository(Achievement);
  const projectRepo = ds.getRepository(Project);
  const collectionRepo = ds.getRepository(Collection);

  // ── Admin user ────────────────────────────────────────────────────────
  const adminEmail = 'admin@mentorai.local';
  let admin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    admin = userRepo.create({
      email: adminEmail,
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: UserRole.ADMIN,
      emailVerified: true,
    });
    await userRepo.save(admin);
    console.log('✓ Created admin user (admin@mentorai.local / admin123)');
  } else {
    console.log('  Admin user already exists');
  }

  // ── Demo user ─────────────────────────────────────────────────────────
  const demoEmail = 'demo@mentorai.local';
  let demo = await userRepo.findOne({ where: { email: demoEmail } });
  if (!demo) {
    demo = userRepo.create({
      email: demoEmail,
      name: 'Demo User',
      passwordHash: await bcrypt.hash('demo123', 12),
      role: UserRole.MEMBER,
      emailVerified: true,
    });
    await userRepo.save(demo);
    console.log('✓ Created demo user (demo@mentorai.local / demo123)');
  } else {
    console.log('  Demo user already exists');
  }

  // ── Default user settings ─────────────────────────────────────────────
  for (const u of [admin, demo]) {
    const existing = await userSettingsRepo.findOne({ where: { userId: u.id } });
    if (!existing) {
      await userSettingsRepo.save(userSettingsRepo.create({
        userId: u.id,
        appearance: { theme: 'system', density: 'comfortable', reduceMotion: false },
        language: 'en',
        notifications: {
          trainingUpdates: true, documentUpdates: true, modelUpdates: true,
          shareUpdates: true, systemUpdates: true, email: true,
        },
        privacy: { shareUsage: false, allowAnalytics: true, allowAIMemory: true },
        defaults: { defaultModel: 'Qwen/Qwen2.5-0.5B-Instruct' },
      }));
    }
  }
  console.log('✓ Default user settings ensured');

  // ── Achievements ──────────────────────────────────────────────────────
  const achievements = [
    { title: 'First Steps', description: 'Complete your first lesson', icon: '🎯', criteria: 'lessons_completed >= 1' },
    { title: 'Quiz Master', description: 'Score 100% on 5 quizzes', icon: '🏆', criteria: 'perfect_quizzes >= 5' },
    { title: 'Bookworm', description: 'Read 10 documents', icon: '📚', criteria: 'documents_read >= 10' },
    { title: 'Streak Keeper', description: 'Maintain a 7-day study streak', icon: '🔥', criteria: 'streak_days >= 7' },
    { title: 'Knowledge Sharer', description: 'Share 3 conversations', icon: '💡', criteria: 'conversations_shared >= 3' },
  ];
  for (const a of achievements) {
    const exists = await achievementRepo.findOne({ where: { title: a.title } });
    if (!exists) {
      await achievementRepo.save(achievementRepo.create(a));
    }
  }
  console.log('✓ 5 default achievements ensured');

  // ── Sample project + collection ───────────────────────────────────────
  let sampleProject = await projectRepo.findOne({ where: { ownerId: demo.id, name: 'Getting Started' } });
  if (!sampleProject) {
    sampleProject = projectRepo.create({
      ownerId: demo.id,
      name: 'Getting Started',
      description: 'Sample project to explore MentorAI',
      color: '#6366f1',
      icon: 'sparkles',
    });
    await projectRepo.save(sampleProject);
    console.log('✓ Created sample project for demo user');
  }

  const sampleCollectionName = 'Introduction';
  const existingCollection = await collectionRepo.findOne({
    where: { projectId: sampleProject.id, name: sampleCollectionName },
  });
  if (!existingCollection) {
    await collectionRepo.save(collectionRepo.create({
      projectId: sampleProject.id,
      name: sampleCollectionName,
      description: 'Sample collection — upload your first PDF here',
      icon: 'folder',
      status: 'ready',
    }));
    console.log('✓ Created sample collection');
  }

  // ── Seed model catalog ─────────────────────────────────────────────────
  const modelRepo = ds.getRepository(Model);
  const catalog: Array<{
    name: string; provider: string; type: 'base' | 'instruct' | 'embedding' | 'reranker';
    size: 'tiny' | 'small' | 'medium' | 'large' | 'xl'; parameters: string;
    description: string; contextWindow: number; license: string; status: ModelStatus; repoId: string;
  }> = [
    { name: 'Llama 3.1 8B Instruct', provider: 'ollama', type: 'instruct', size: 'small', parameters: '8.03B', description: 'High-quality instruction-tuned chat model for general tasks.', contextWindow: 128_000, license: 'Llama-3.1 Community', status: 'available', repoId: 'meta-llama/Llama-3.1-8B-Instruct' },
    { name: 'Mistral 7B Instruct v0.3', provider: 'ollama', type: 'instruct', size: 'small', parameters: '7.25B', description: 'Efficient and capable instruct model.', contextWindow: 32_000, license: 'Apache-2.0', status: 'available', repoId: 'mistralai/Mistral-7B-Instruct-v0.3' },
    { name: 'Qwen 2.5 7B Instruct', provider: 'ollama', type: 'instruct', size: 'small', parameters: '7.62B', description: 'Multilingual instruction-tuned model.', contextWindow: 32_000, license: 'Qwen-Research', status: 'available', repoId: 'Qwen/Qwen2.5-7B-Instruct' },
    { name: 'Phi-3 Mini 3.8B', provider: 'ollama', type: 'instruct', size: 'tiny', parameters: '3.82B', description: 'Compact reasoning-focused model.', contextWindow: 4096, license: 'MIT', status: 'available', repoId: 'microsoft/Phi-3-mini-4k-instruct' },
    { name: 'Gemma 2 9B IT', provider: 'ollama', type: 'instruct', size: 'medium', parameters: '9.24B', description: 'Versatile instruction-tuned open model.', contextWindow: 8192, license: 'Gemma Terms of Use', status: 'available', repoId: 'google/gemma-2-9b-it' },
    { name: 'Llama 3.2 3B', provider: 'ollama', type: 'base', size: 'tiny', parameters: '3.21B', description: 'Small base model for fine-tuning.', contextWindow: 128_000, license: 'Llama-3.2 Community', status: 'available', repoId: 'meta-llama/Llama-3.2-3B' },
    { name: 'BGE-M3 Embeddings', provider: 'ollama', type: 'embedding', size: 'medium', parameters: '568M', description: 'Multilingual embedding model for retrieval.', contextWindow: 8192, license: 'MIT', status: 'available', repoId: 'BAAI/bge-m3' },
    { name: 'Cohere Rerank v3 (local)', provider: 'ollama', type: 'reranker', size: 'medium', parameters: '1.5B', description: 'Local reranking model for search precision.', contextWindow: 4096, license: 'CC-BY-4.0', status: 'available', repoId: 'Cohere/wind-onnx' },
  ];
  for (const [i, m] of catalog.entries()) {
    const existingModel = await modelRepo.findOne({ where: { name: m.name } });
    if (existingModel) continue;
    await modelRepo.save(modelRepo.create({
      userId: admin.id,
      name: m.name,
      repoId: m.repoId,
      provider: m.provider,
      type: m.type,
      size: m.size,
      parameters: m.parameters,
      description: m.description,
      contextWindow: m.contextWindow,
      license: m.license,
      status: m.status,
      installedAt: m.status === 'installed' ? new Date() : undefined,
      downloadProgress: m.status === 'installed' ? 100 : undefined,
      default: i === 0,
      loaded: i === 0,
      tags: ['general'],
    }));
  }
  console.log(`✓ Seeded ${catalog.length} models for admin user`);

  console.log('\nSeed complete. Test credentials:');
  console.log('  Admin: admin@mentorai.local / admin123');
  console.log('  User:  demo@mentorai.local  / demo123');
  await ds.destroy();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
