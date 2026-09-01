import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { protect, AuthRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';

describe('protect middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let next: NextFunction;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
    mockReq = {
      headers: {},
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('returns 401 when no authorization header is present', async () => {
    await protect(mockReq as AuthRequest, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized, no token provided' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid or fails verification', async () => {
    mockReq.headers = { authorization: 'Bearer bad-token' };
    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    await protect(mockReq as AuthRequest, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized, token failed' }),
    );
  });

  it('returns 401 when user is not found in database', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    vi.spyOn(jwt, 'verify').mockReturnValue({ id: 'u1' } as any);
    vi.spyOn(User, 'findById').mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    } as any);

    await protect(mockReq as AuthRequest, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'User not found' }),
    );
  });

  it('sets req.user and calls next() when token and user are valid', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    vi.spyOn(jwt, 'verify').mockReturnValue({ id: 'u1' } as any);
    vi.spyOn(User, 'findById').mockReturnValue({
      select: vi.fn().mockResolvedValue({ _id: 'u1', name: 'Valid User' }),
    } as any);

    await protect(mockReq as AuthRequest, mockRes as Response, next);

    expect(mockReq.user).toEqual({ _id: 'u1', name: 'Valid User' });
    expect(next).toHaveBeenCalled();
  });
});
