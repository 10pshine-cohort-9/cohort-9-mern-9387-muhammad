import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as NonNullable<SignOptions['expiresIn']>,
  });
};
