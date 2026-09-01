import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { exportNotes, importNotes } from '../controllers/noteIOController.js';
import { Note, INote } from '../models/Note.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { IUser } from '../models/User.js';

vi.mock('../services/notePublisher.js', () => ({
  publishNotesImported: vi.fn(),
}));

describe('Note IO Controller (Export & Import)', () => {
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
      query: {},
      body: {},
    };
    vi.clearAllMocks();
  });

  describe('exportNotes', () => {
    it('successfully exports all notes for authenticated user', async () => {
      const mockNotes = [
        {
          title: 'Exported Note',
          content: 'Export content',
          color: '#ffffff',
          tags: ['test'],
          isPinned: false,
          isArchived: false,
          isTrashed: false,
          createdAt: new Date(),
        },
      ];

      vi.spyOn(Note, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockNotes),
      } as unknown as ReturnType<typeof Note.find>);

      await exportNotes(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 1,
          count: 1,
          notes: expect.arrayContaining([
            expect.objectContaining({ title: 'Exported Note' }),
          ]),
        }),
      );
    });

    it('filters by scope when query scope is notes or trash', async () => {
      const findSpy = vi.spyOn(Note, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as unknown as ReturnType<typeof Note.find>);

      // Scope: notes
      mockReq.query = { scope: 'notes' };
      await exportNotes(mockReq as AuthRequest, mockRes as Response);
      expect(findSpy).toHaveBeenCalledWith(
        expect.objectContaining({ user: 'user-123', isArchived: false, isTrashed: false }),
      );

      // Scope: trash
      mockReq.query = { scope: 'trash' };
      await exportNotes(mockReq as AuthRequest, mockRes as Response);
      expect(findSpy).toHaveBeenCalledWith(
        expect.objectContaining({ user: 'user-123', isTrashed: true }),
      );
    });

    it('returns 500 on database error during export', async () => {
      vi.spyOn(Note, 'find').mockReturnValue({
        sort: vi.fn().mockRejectedValue(new Error('DB failure')),
      } as unknown as ReturnType<typeof Note.find>);

      await exportNotes(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Failed to export notes' }),
      );
    });
  });

  describe('importNotes', () => {
    it('returns 400 if notes array is missing or invalid', async () => {
      mockReq.body = {};
      await importNotes(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'This file is not a valid Shine Notes backup file.',
        }),
      );
    });

    it('returns 400 if notes array has no valid title/content', async () => {
      mockReq.body = { notes: [{ title: '', content: '' }] };
      await importNotes(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No valid notes found in the imported file.',
        }),
      );
    });

    it('inserts valid notes with default fallback colors and tags and returns 201', async () => {
      mockReq.body = {
        notes: [
          {
            title: 'Imported Note 1',
            content: 'Imported Content 1',
            color: null,
            tags: null,
          },
        ],
      };

      const inserted = [{ _id: 'new-id-1', title: 'Imported Note 1' }];
      vi.spyOn(Note, 'insertMany').mockResolvedValue(inserted as unknown as INote[]);

      await importNotes(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          importedCount: 1,
        }),
      );
    });

    it('returns 500 on unexpected database error during import', async () => {
      mockReq.body = { notes: [{ title: 'Note', content: 'Body' }] };
      vi.spyOn(Note, 'insertMany').mockRejectedValue(new Error('Insert error'));

      await importNotes(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Failed to import notes' }),
      );
    });
  });
});
