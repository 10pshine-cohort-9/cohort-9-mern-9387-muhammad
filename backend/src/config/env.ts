import 'dotenv/config';

const port = Number(process.env.PORT ?? 4000);

if (Number.isNaN(port)) {
  throw new Error('PORT must be a valid number');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port,
  mongodbUri:
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/shine_notes_cohort9',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
} as const;
