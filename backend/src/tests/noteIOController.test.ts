import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { exportNotes, importNotes } from '../controllers/noteIOController.js';
import { Note } from '../models/Note.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

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
        _id: 'user-123' as any,
        name: 'Test User',
        email: 'test@example.com',
      } as any,
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
      } as any);

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

    it('filters by scope when query scope is provided', async () => {
      mockReq.query = { scope: 'archived' };
      const findSpy = vi.spyOn(Note, 'find').mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      } as any);

      await exportNotes(mockReq as AuthRequest, mockRes as Response);

      expect(findSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          user: 'user-123',
          isArchived: true,
          isTrashed: false,
        }),
      );
      expect(statusMock).toHaveBeenCalledWith(200);
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

    it('inserts valid notes and returns 201', async () => {
      mockReq.body = {
        notes: [
          {
            title: 'Imported Note 1',
            content: 'Imported Content 1',
            tags: ['import'],
          },
        ],
      };

      const inserted = [{ _id: 'new-id-1', title: 'Imported Note 1' }];
      vi.spyOn(Note, 'insertMany').mockResolvedValue(inserted as any);

      await importNotes(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          importedCount: 1,
        }),
      );
    });
  });
});
