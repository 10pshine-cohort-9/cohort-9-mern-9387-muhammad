import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Environment Configuration Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('loads valid environment configuration successfully', async () => {
    process.env.NODE_ENV = 'development';
    process.env.PORT = '4000';
    process.env.JWT_SECRET = 'a_very_long_secure_secret_key_with_at_least_32_bytes_length';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/testdb';
    process.env.CLIENT_URL = 'http://localhost:5173';
    process.env.JWT_EXPIRES_IN = '7d';

    const { env } = await import('../config/env.js');

    expect(env.port).toBe(4000);
    expect(env.jwtExpiresIn).toBe('7d');
  });

  it('throws error if PORT is invalid', async () => {
    process.env.PORT = 'invalid-port';

    await expect(import('../config/env.js')).rejects.toThrow(
      'PORT must be a valid integer between 1 and 65535',
    );
  });

  it('throws error if JWT_SECRET is placeholder or shorter than 32 bytes', async () => {
    process.env.PORT = '4000';
    process.env.JWT_SECRET = 'replace_with_a_long_random_secret';

    await expect(import('../config/env.js')).rejects.toThrow(
      'JWT_SECRET must be a non-placeholder secret of at least 32 bytes',
    );
  });

  it('throws error if MONGODB_URI is missing in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '4000';
    process.env.JWT_SECRET = 'a_very_long_secure_secret_key_with_at_least_32_bytes_length';
    delete process.env.MONGODB_URI;

    await expect(import('../config/env.js')).rejects.toThrow(
      'MONGODB_URI is required in production',
    );
  });

  it('throws error if CLIENT_URL is missing in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '4000';
    process.env.JWT_SECRET = 'a_very_long_secure_secret_key_with_at_least_32_bytes_length';
    process.env.MONGODB_URI = 'mongodb+srv://user:pass@cluster.mongodb.net/test';
    delete process.env.CLIENT_URL;

    await expect(import('../config/env.js')).rejects.toThrow(
      'CLIENT_URL is required in production',
    );
  });

  it('throws error if JWT_EXPIRES_IN format is invalid', async () => {
    process.env.PORT = '4000';
    process.env.JWT_SECRET = 'a_very_long_secure_secret_key_with_at_least_32_bytes_length';
    process.env.JWT_EXPIRES_IN = '7weeks';

    await expect(import('../config/env.js')).rejects.toThrow(
      'JWT_EXPIRES_IN must match the pattern',
    );
  });
});
