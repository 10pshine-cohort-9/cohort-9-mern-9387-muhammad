import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

export type AuthErrorResponse = {
  success: false;
  message: string;
};

export type RegisterSuccessResponse = {
  success: true;
  message: string;
  token: string;
  user: {
    id: unknown;
    name: string;
    email: string;
  };
};

export type LoginSuccessResponse = {
  success: true;
  message: string;
  token: string;
  user: {
    id: unknown;
    name: string;
    email: string;
  };
};

export type RegisterResponse = RegisterSuccessResponse | AuthErrorResponse;
export type LoginResponse = LoginSuccessResponse | AuthErrorResponse;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (
  req: Request<Record<string, never>, RegisterResponse, RegisterBody>,
  res: Response<RegisterResponse>,
): Promise<void> => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        success: false,
        message: 'Name is required',
      });
      return;
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
      return;
    }

    if (
      !password ||
      typeof password !== 'string' ||
      password.length < 6 ||
      bcrypt.truncates(password)
    ) {
      res.status(400).json({
        success: false,
        message:
          password && typeof password === 'string' && bcrypt.truncates(password)
            ? 'Password exceeds maximum length of 72 bytes'
            : 'Password must be at least 6 characters long',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User already exists',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({
        success: false,
        message: 'User already exists',
      });
      return;
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

export const login = async (
  req: Request<Record<string, never>, LoginResponse, LoginBody>,
  res: Response<LoginResponse>,
): Promise<void> => {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
      return;
    }

    if (!password || typeof password !== 'string' || bcrypt.truncates(password)) {
      res.status(400).json({
        success: false,
        message:
          password && typeof password === 'string' && bcrypt.truncates(password)
            ? 'Password exceeds maximum length of 72 bytes'
            : 'Password is required',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
      return;
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6 || bcrypt.truncates(newPassword)) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters and under 72 bytes',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password update',
    });
  }
};

