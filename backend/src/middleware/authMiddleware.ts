import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res
          .status(401)
          .json({
            success: false,
            message: 'Not authorized, no token provided',
          });
        return;
      }

      // Verify and validate token
      const decoded = jwt.verify(token, env.jwtSecret);
      if (typeof decoded === 'string' || typeof decoded.id !== 'string') {
        res
          .status(401)
          .json({ success: false, message: 'Not authorized, invalid token' });
        return;
      }

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }

      req.user = user;
      next();
      return;
    } catch (error) {
      console.error('Auth middleware error:', error);
      res
        .status(401)
        .json({ success: false, message: 'Not authorized, token failed' });
      return;
    }
  }

  res
    .status(401)
    .json({ success: false, message: 'Not authorized, no token provided' });
};
