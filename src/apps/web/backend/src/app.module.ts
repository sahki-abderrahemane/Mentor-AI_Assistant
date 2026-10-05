import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppConfig, validateEnv } from './config/index.js';
import { RedisModule } from './shared/redis/redis.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { CollectionsModule } from './modules/collections/collections.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { QuizzesModule } from './modules/quizzes/quizzes.module.js';
import { FlashcardsModule } from './modules/flashcards/flashcards.module.js';
import { StudyGuidesModule } from './modules/study-guides/study-guides.module.js';
import { LearningModule } from './modules/learning/learning.module.js';
import { GenerationModule } from './modules/generation/generation.module.js';
import { TrainingModule } from './modules/training/training.module.js';
import { ModelsModule } from './modules/models/models.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { SettingsModule } from './modules/settings/settings.module.js';
import { HealthModule } from './modules/health/health.module.js';
import {AppLoggerMiddleware} from './shared/utils/app-logger.middleware.js';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      validate: validateEnv,
      load: [AppConfig.load],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL')!,
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
        // logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get('REDIS_URL')!,
        },
      }),
    }),

    ScheduleModule.forRoot(),

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    // LoggerModule.forRoot({
    //   pinoHttp: {
    //     level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    //     transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
    //   },
    // }),

    RedisModule,

    AuthModule,
    UsersModule,
    StorageModule,
    ProjectsModule,
    CollectionsModule,
    DocumentsModule,
    ChatModule,
    SearchModule,
    QuizzesModule,
    FlashcardsModule,
    StudyGuidesModule,
    LearningModule,
    GenerationModule,
    TrainingModule,
    ModelsModule,
    NotificationsModule,
    DashboardModule,
    AdminModule,
    SettingsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}