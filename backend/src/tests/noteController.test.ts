import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import mongoose from 'mongoose';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js';
import { Note, INote } from '../models/Note.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { IUser } from '../models/User.js';

describe('Note Controller', () => {
  let mockReq: Partial<AuthRequest>;
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
      user: {
        _id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      } as unknown as IUser,
      params: {},
      body: {},
    };
    vi.clearAllMocks();
  });

  describe('getNotes', () => {
    it('returns 401 if user is not in request', async () => {
      mockReq.user = undefined;
      await getNotes(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('returns all notes for user', async () => {
      const mockNotes = [{ _id: 'n1', title: 'Note 1' }];
      vi.spyOn(Note, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockNotes),
      } as unknown as ReturnType<typeof Note.find>);

      await getNotes(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockNotes,
      });
    });

    it('handles query find call with user id', async () => {
      const findSpy = vi.spyOn(Note, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as unknown as ReturnType<typeof Note.find>);

      await getNotes(mockReq as AuthRequest, mockRes as Response);

      expect(findSpy).toHaveBeenCalledWith({ user: 'user-123' });
    });

    it('returns 500 on database failure in getNotes', async () => {
      vi.spyOn(Note, 'find').mockReturnValue({
        sort: vi.fn().mockRejectedValue(new Error('DB failure')),
      } as unknown as ReturnType<typeof Note.find>);

      await getNotes(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('getNoteById', () => {
    it('returns 401 if user is missing', async () => {
      mockReq.user = undefined;
      await getNoteById(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('returns 404 if note not found', async () => {
      mockReq.params = { id: '650000000000000000000001' };
      vi.spyOn(Note, 'findById').mockResolvedValue(null);

      await getNoteById(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Note not found',
      });
    });

    it('returns 403 if note belongs to another user', async () => {
      mockReq.params = { id: '650000000000000000000001' };
      vi.spyOn(Note, 'findById').mockResolvedValue({
        user: 'other-user',
      } as unknown as INote);

      await getNoteById(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('returns 200 with note data if found and owned by user', async () => {
      mockReq.params = { id: '650000000000000000000001' };
      const sampleNote = { _id: '650000000000000000000001', user: 'user-123', title: 'Found' };
      vi.spyOn(Note, 'findById').mockResolvedValue(sampleNote as unknown as INote);

      await getNoteById(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: sampleNote,
      });
    });

    it('returns 400 on CastError', async () => {
      mockReq.params = { id: 'invalid-id' };
      vi.spyOn(Note, 'findById').mockRejectedValue(new mongoose.Error.CastError('ObjectId', 'invalid-id', 'id'));

      await getNoteById(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe('createNote', () => {
    it('returns 401 if user is missing', async () => {
      mockReq.user = undefined;
      await createNote(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('returns 400 if title or content is empty', async () => {
      mockReq.body = { title: '', content: '' };
      await createNote(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('creates note and returns 201 on valid input', async () => {
      mockReq.body = { title: 'New Note', content: 'Content' };
      const createdNote = { _id: 'new-id', title: 'New Note', content: 'Content', user: 'user-123' };
      vi.spyOn(Note, 'create').mockResolvedValue(createdNote as unknown as INote[]);

      await createNote(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: createdNote,
        }),
      );
    });

    it('returns 500 on unexpected database error during create', async () => {
      mockReq.body = { title: 'New Note', content: 'Content' };
      vi.spyOn(Note, 'create').mockRejectedValue(new Error('DB failure'));

      await createNote(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Failed to create note' }),
      );
    });
  });

  describe('updateNote', () => {
    it('returns 401 if user is missing', async () => {
      mockReq.user = undefined;
      await updateNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('returns 400 if title or content is non-string type', async () => {
      mockReq.body = { title: 123 as unknown as string };
      await updateNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Title and content must be strings' }),
      );
    });

    it('returns 400 if both title and content are missing or invalid', async () => {
      mockReq.body = {};
      await updateNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('returns 404 if note not found', async () => {
      mockReq.params = { id: 'n1' };
      mockReq.body = { title: 'Updated' };
      vi.spyOn(Note, 'findById').mockResolvedValue(null);

      await updateNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('returns 403 if note belongs to another user', async () => {
      mockReq.params = { id: 'n1' };
      mockReq.body = { title: 'Updated' };
      vi.spyOn(Note, 'findById').mockResolvedValue({ user: 'other-user' } as unknown as INote);

      await updateNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('updates note and returns 200 on valid input', async () => {
      mockReq.params = { id: 'n1' };
      mockReq.body = { title: 'Updated Title', content: 'Updated Content' };
      const existing = {
        _id: 'n1',
        user: 'user-123',
        title: 'Old Title',
        content: 'Old Content',
        save: vi.fn().mockResolvedValue({
          _id: 'n1',
          user: 'user-123',
          title: 'Updated Title',
          content: 'Updated Content',
        }),
      };
      vi.spyOn(Note, 'findById').mockResolvedValue(existing as unknown as INote);

      await updateNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Note updated successfully' }),
      );
    });

    it('returns 400 on CastError during update', async () => {
      mockReq.params = { id: 'invalid-id' };
      mockReq.body = { title: 'Valid Title' };
      vi.spyOn(Note, 'findById').mockRejectedValue(
        new mongoose.Error.CastError('ObjectId', 'invalid-id', 'id'),
      );

      await updateNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid note ID format' }),
      );
    });

    it('returns 500 on unexpected failure', async () => {
      mockReq.params = { id: 'n1' };
      mockReq.body = { title: 'Valid Title' };
      vi.spyOn(Note, 'findById').mockRejectedValue(new Error('DB failure'));

      await updateNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteNote', () => {
    it('returns 401 if user is missing', async () => {
      mockReq.user = undefined;
      await deleteNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('returns 404 if note not found', async () => {
      mockReq.params = { id: 'n1' };
      vi.spyOn(Note, 'findById').mockResolvedValue(null);

      await deleteNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it('returns 403 if note belongs to another user', async () => {
      mockReq.params = { id: 'n1' };
      vi.spyOn(Note, 'findById').mockResolvedValue({ user: 'other-user' } as unknown as INote);

      await deleteNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('deletes note and returns 200', async () => {
      mockReq.params = { id: 'n1' };
      const existing = {
        _id: 'n1',
        user: 'user-123',
        deleteOne: vi.fn().mockResolvedValue({}),
      };
      vi.spyOn(Note, 'findById').mockResolvedValue(existing as unknown as INote);

      await deleteNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Note deleted successfully' }),
      );
    });

    it('returns 400 on CastError during delete', async () => {
      mockReq.params = { id: 'invalid-id' };
      vi.spyOn(Note, 'findById').mockRejectedValue(
        new mongoose.Error.CastError('ObjectId', 'invalid-id', 'id'),
      );

      await deleteNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid note ID format' }),
      );
    });

    it('returns 500 on database error during delete', async () => {
      mockReq.params = { id: 'n1' };
      vi.spyOn(Note, 'findById').mockRejectedValue(new Error('DB failure'));

      await deleteNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });
});
