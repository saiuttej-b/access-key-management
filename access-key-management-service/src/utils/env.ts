import { z } from 'zod';

export const Environments = Object.freeze({
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
});

export const EnvSchema = z.object({
  TZ: z.string(),
  PORT: z.coerce.number().positive(),
  PROJECT_ENVIRONMENT: z.string(),

  CORS_ORIGIN: z.string().optional(),

  JWT_SECRET: z.string(),
  JWT_EXPIRATION_TIME: z.string(),

  MONGO_DB_HOST: z.string(),
  MONGO_DB_USERNAME: z.string(),
  MONGO_DB_PASSWORD: z.string(),
  MONGO_DB_DATABASE: z.string(),
  MONGO_DB_AUTO_INDEX: z.string().optional().default('false'),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().positive(),
});

export type EnvType = z.infer<typeof EnvSchema>;
