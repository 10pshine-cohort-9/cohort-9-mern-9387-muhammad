import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { register, login, changePassword } from '../controllers/authController.js';
import { User } from '../models/User.js';

describe('Auth Controller Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
    mockReq = {
      body: {},
    };
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('returns 400 if name is missing', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      await register(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Name is required' }),
      );
    });

    it('returns 400 if email is invalid', async () => {
      mockReq.body = { name: 'Test', email: 'invalid-email', password: 'password123' };
      await register(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Please provide a valid email address' }),
      );
    });

    it('returns 400 if password is too short', async () => {
      mockReq.body = { name: 'Test', email: 'test@example.com', password: '123' };
      await register(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Password must be at least 6 characters long' }),
      );
    });

    it('returns 400 if password exceeds maximum bcrypt length', async () => {
      mockReq.body = { name: 'Test', email: 'test@example.com', password: 'a'.repeat(80) };
      await register(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Password exceeds maximum length of 72 bytes' }),
      );
    });

    it('returns 409 if user already exists', async () => {
      mockReq.body = { name: 'Test', email: 'test@example.com', password: 'password123' };
      vi.spyOn(User, 'findOne').mockResolvedValue({ _id: 'u1' } as unknown as IUser);

      await register(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User already exists' }),
      );
    });

    it('creates user and returns 201 with token', async () => {
      mockReq.body = { name: 'New User', email: 'new@example.com', password: 'password123' };
      vi.spyOn(User, 'findOne').mockResolvedValue(null);
      vi.spyOn(User, 'create').mockResolvedValue({
        _id: 'new-id',
        name: 'New User',
        email: 'new@example.com',
      } as unknown as IUser[]);

      await register(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
          user: expect.objectContaining({ email: 'new@example.com' }),
        }),
      );
    });

    it('returns 409 if database throws duplicate key error code 11000', async () => {
      mockReq.body = { name: 'Test', email: 'test@example.com', password: 'password123' };
      vi.spyOn(User, 'findOne').mockResolvedValue(null);
      const duplicateErr = Object.assign(new Error('E11000 duplicate key error'), { code: 11000 });
      vi.spyOn(User, 'create').mockRejectedValue(duplicateErr);

      await register(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User already exists' }),
      );
    });

    it('returns 500 on unexpected database error during registration', async () => {
      mockReq.body = { name: 'Test', email: 'test@example.com', password: 'password123' };
      vi.spyOn(User, 'findOne').mockRejectedValue(new Error('DB failure'));

      await register(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Server error during registration' }),
      );
    });
  });

  describe('login', () => {
    it('returns 400 if email is invalid', async () => {
      mockReq.body = { email: 'bad-email', password: 'password123' };
      await login(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('returns 400 if password is missing', async () => {
      mockReq.body = { email: 'test@example.com' };
      await login(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('returns 401 if user not found', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      vi.spyOn(User, 'findOne').mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      } as unknown as ReturnType<typeof User.findOne>);

      await login(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('returns 401 if password does not match', async () => {
      mockReq.body = { email: 'test@example.com', password: 'wrongpassword' };
      vi.spyOn(User, 'findOne').mockReturnValue({
        select: vi.fn().mockResolvedValue({
          _id: 'u1',
          name: 'User',
          email: 'test@example.com',
          password: 'hashedpassword',
        }),
      } as unknown as ReturnType<typeof User.findOne>);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await login(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('returns 200 with token on valid login', async () => {
      mockReq.body = { email: 'test@example.com', password: 'correctpassword' };
      vi.spyOn(User, 'findOne').mockReturnValue({
        select: vi.fn().mockResolvedValue({
          _id: 'u1',
          name: 'User',
          email: 'test@example.com',
          password: 'hashedpassword',
        }),
      } as unknown as ReturnType<typeof User.findOne>);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await login(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          token: expect.any(String),
        }),
      );
    });

    it('returns 500 on unexpected login database error', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      vi.spyOn(User, 'findOne').mockImplementation(() => {
        throw new Error('Database disconnected');
      });

      await login(mockReq as unknown as Request, mockRes as unknown as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Server error during login' }),
      );
    });
  });

  describe('changePassword', () => {
    it('returns 400 if current or new password is missing', async () => {
      mockReq.body = { currentPassword: '' };
      await changePassword(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('returns 400 if new password is too short or exceeds max length', async () => {
      mockReq.body = { currentPassword: 'oldpassword', newPassword: '123' };
      await changePassword(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);

      mockReq.body = { currentPassword: 'oldpassword', newPassword: 'a'.repeat(80) };
      await changePassword(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('returns 200 on valid changePassword payload', async () => {
      mockReq.body = { currentPassword: 'oldpassword', newPassword: 'newsecurepassword' };
      await changePassword(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Password updated successfully' }),
      );
    });
  });
});
