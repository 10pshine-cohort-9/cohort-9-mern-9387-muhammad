import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';

const port = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid integer between 1 and 65535');
}

const jwtSecret = process.env.JWT_SECRET;

if (
  !jwtSecret ||
  jwtSecret === 'replace_with_a_long_random_secret' ||
  Buffer.byteLength(jwtSecret) < 32
) {
  throw new Error(
    'JWT_SECRET must be a non-placeholder secret of at least 32 bytes',
  );
}

const mongodbUri =
  process.env.MONGODB_URI ?? (nodeEnv === 'production' ? '' : 'mongodb://127.0.0.1:27017/shine_notes_cohort9');

if (!mongodbUri) {
  throw new Error('MONGODB_URI is required in production');
}

const JWT_EXPIRES_IN_PATTERN = /^\d+[smhd]$/;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

if (!JWT_EXPIRES_IN_PATTERN.test(jwtExpiresIn)) {
  throw new Error(
    'JWT_EXPIRES_IN must match the pattern "<number><unit>" where unit is s, m, h, or d (e.g. "7d", "1h")',
  );
}

export const env = {
  nodeEnv,
  port,
  mongodbUri,
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  jwtSecret,
  jwtExpiresIn,
} as const;
