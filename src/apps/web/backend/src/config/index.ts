import { ZodError, z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_PORT: z.string().default('3001'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().url(),

  REDIS_URL: z.string().url(),

  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),

  AI_INFERENCE_URL: z.string().url().default('http://ai-inference:8000'),
  AI_PROCESSING_URL: z.string().url().default('http://ai-processing:8001'),
  AI_TRAINING_URL: z.string().url().default('http://ai-training:8002'),

  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.string().default('50'),

  DB_SYNCHRONIZE: z.enum(['true', 'false']).default('false'),
});

export const AppConfig = {
  load: (env: Record<string, string | undefined> = process.env) => {
    const raw = {
      NODE_ENV: env.NODE_ENV,
      APP_PORT: env.APP_PORT,
      CORS_ORIGIN: env.CORS_ORIGIN,
      DATABASE_URL: env.DATABASE_URL,
      REDIS_URL: env.REDIS_URL,
      JWT_SECRET: env.JWT_SECRET,
      JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
      JWT_ACCESS_TTL: env.JWT_ACCESS_TTL,
      JWT_REFRESH_TTL: env.JWT_REFRESH_TTL,
      AI_INFERENCE_URL: env.AI_INFERENCE_URL,
      AI_PROCESSING_URL: env.AI_PROCESSING_URL,
      AI_TRAINING_URL: env.AI_TRAINING_URL,
      UPLOAD_DIR: env.UPLOAD_DIR,
      MAX_FILE_SIZE_MB: env.MAX_FILE_SIZE_MB,
      DB_SYNCHRONIZE: env.DB_SYNCHRONIZE,
    };
    const result = envSchema.safeParse(raw);
    if (!result.success) {
      throw new Error(`Invalid environment variables:\n${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')}`);
    }
    return result.data;
  },
};

export function validateEnv(config: Record<string, string>): Record<string, string> {
  return AppConfig.load(config) as Record<string, string>;
}

export const zodSchema = envSchema;