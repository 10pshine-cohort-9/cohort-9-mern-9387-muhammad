import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js';
import { Note } from '../models/Note.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

describe('Note Controller', () => {
  let mockReq: Partial<AuthRequest<any, any>>;
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
        _id: 'user-123' as any,
        name: 'Test User',
        email: 'test@example.com',
      } as any,
      params: {},
      body: {},
    };
    vi.clearAllMocks();
  });

  describe('getNotes', () => {
    it('returns all notes for user', async () => {
      const mockNotes = [{ _id: 'n1', title: 'Note 1' }];
      vi.spyOn(Note, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockNotes),
      } as any);

      await getNotes(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockNotes,
      });
    });
  });

  describe('getNoteById', () => {
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
      } as any);

      await getNoteById(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it('returns 200 with note data if found and owned by user', async () => {
      mockReq.params = { id: '650000000000000000000001' };
      const sampleNote = { _id: '650000000000000000000001', user: 'user-123', title: 'Found' };
      vi.spyOn(Note, 'findById').mockResolvedValue(sampleNote as any);

      await getNoteById(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: sampleNote,
      });
    });
  });

  describe('createNote', () => {
    it('returns 400 if title or content is empty', async () => {
      mockReq.body = { title: '', content: '' };
      await createNote(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('creates and returns note with 201', async () => {
      mockReq.body = { title: 'New Note', content: 'New Content' };
      const created = { _id: 'n-new', title: 'New Note', content: 'New Content', user: 'user-123' };
      vi.spyOn(Note, 'create').mockResolvedValue(created as any);

      await createNote(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: created,
        }),
      );
    });
  });

  describe('updateNote', () => {
    it('returns 400 if no title and no content provided', async () => {
      mockReq.params = { id: '650000000000000000000001' };
      mockReq.body = {};

      await updateNote(mockReq as AuthRequest<any, { id: string }>, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('updates note and returns 200', async () => {
      mockReq.params = { id: '650000000000000000000001' };
      mockReq.body = { title: 'Updated Title' };

      const existingNote = {
        _id: '650000000000000000000001',
        user: 'user-123',
        title: 'Old Title',
        content: 'Content',
        save: vi.fn().mockResolvedValue({
          _id: '650000000000000000000001',
          user: 'user-123',
          title: 'Updated Title',
        }),
      };

      vi.spyOn(Note, 'findById').mockResolvedValue(existingNote as any);

      await updateNote(mockReq as AuthRequest<any, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(existingNote.save).toHaveBeenCalled();
    });
  });

  describe('deleteNote', () => {
    it('deletes note and returns 200', async () => {
      mockReq.params = { id: '650000000000000000000001' };
      const existingNote = {
        _id: '650000000000000000000001',
        user: 'user-123',
        deleteOne: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(Note, 'findById').mockResolvedValue(existingNote as any);

      await deleteNote(mockReq as AuthRequest<unknown, { id: string }>, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(existingNote.deleteOne).toHaveBeenCalled();
    });
  });
});
