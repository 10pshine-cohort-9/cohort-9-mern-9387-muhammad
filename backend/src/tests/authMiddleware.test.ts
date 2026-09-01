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

  it('returns 401 when Bearer prefix is present but token string is missing', async () => {
    mockReq.headers = { authorization: 'Bearer ' };

    await protect(mockReq as AuthRequest, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized, no token provided' }),
    );
  });

  it('returns 401 when decoded token is a string or missing id', async () => {
    mockReq.headers = { authorization: 'Bearer some-token' };
    vi.spyOn(jwt, 'verify').mockReturnValue('string-payload' as unknown as jwt.JwtPayload);

    await protect(mockReq as AuthRequest, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authorized, invalid token' }),
    );

    // Missing id field
    vi.spyOn(jwt, 'verify').mockReturnValue({ role: 'admin' } as unknown as jwt.JwtPayload);

    await protect(mockReq as AuthRequest, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
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
    vi.spyOn(jwt, 'verify').mockReturnValue({ id: 'u1' } as unknown as jwt.JwtPayload);
    vi.spyOn(User, 'findById').mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    } as unknown as ReturnType<typeof User.findById>);

    await protect(mockReq as AuthRequest, mockRes as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'User not found' }),
    );
  });

  it('sets req.user and calls next() when token and user are valid', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    vi.spyOn(jwt, 'verify').mockReturnValue({ id: 'u1' } as unknown as jwt.JwtPayload);
    vi.spyOn(User, 'findById').mockReturnValue({
      select: vi.fn().mockResolvedValue({ _id: 'u1', name: 'Valid User' }),
    } as unknown as ReturnType<typeof User.findById>);

    await protect(mockReq as AuthRequest, mockRes as Response, next);

    expect(mockReq.user).toEqual({ _id: 'u1', name: 'Valid User' });
    expect(next).toHaveBeenCalled();
  });
});
