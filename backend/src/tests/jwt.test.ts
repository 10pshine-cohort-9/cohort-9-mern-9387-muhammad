import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

describe('JWT Utility', () => {
  it('generates a valid signed JWT token containing the user id', () => {
    const userId = 'user-123456';
    const token = generateToken(userId);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, env.jwtSecret) as { id: string };
    expect(decoded.id).toBe(userId);
  });
});
