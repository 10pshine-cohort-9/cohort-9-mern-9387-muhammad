import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
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
        res.status(401).json({
          success: false,
          message: 'Not authorized, no token provided',
        });
        return;
      }

      // Double-cast for jwt.verify return type
      const decoded = jwt.verify(token, env.jwtSecret) as unknown as JwtPayload;

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }

      req.user = user;
      next();
      return;
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error,
      });
      return;
    }
  }

  res
    .status(401)
    .json({ success: false, message: 'Not authorized, no token provided' });
};
