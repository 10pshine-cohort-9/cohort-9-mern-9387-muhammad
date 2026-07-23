import 'dotenv/config';

const port = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid integer between 1 and 65535');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port,
  mongodbUri:
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/shine_notes_cohort9',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'shine_secret_key_10p_cohort9',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
} as const;
