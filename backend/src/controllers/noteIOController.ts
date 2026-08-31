import { Response } from 'express';
import { Note } from '../models/Note.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { publishNotesImported } from '../services/notePublisher.js';

export const exportNotes = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { scope } = req.query;

    const filter: Record<string, unknown> = { user: userId };
    if (scope === 'notes') {
      filter.isTrashed = false;
      filter.isArchived = false;
    } else if (scope === 'archived') {
      filter.isTrashed = false;
      filter.isArchived = true;
    } else if (scope === 'trash') {
      filter.isTrashed = true;
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 });

    const exportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      scope: typeof scope === 'string' ? scope : 'all',
      count: notes.length,
      notes: notes.map((n) => ({
        title: n.title,
        content: n.content,
        color: n.color,
        tags: n.tags,
        isPinned: n.isPinned,
        isArchived: n.isArchived,
        isTrashed: n.isTrashed,
        createdAt: n.createdAt,
      })),
    };

    res.status(200).json(exportPayload);
  } catch (error) {
    console.error('Export notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export notes',
    });
  }
};

export const importNotes = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { notes } = (req.body as { notes?: Array<Record<string, unknown>> }) || {};

    if (!Array.isArray(notes)) {
      res.status(400).json({
        success: false,
        message: 'This file is not a valid Shine Notes backup file.',
      });
      return;
    }

    const validNotesToInsert: Array<Record<string, unknown>> = [];

    notes.forEach((n) => {
      if (
        n &&
        typeof n.title === 'string' &&
        n.title.trim() &&
        typeof n.content === 'string' &&
        n.content.trim()
      ) {
        validNotesToInsert.push({
          user: userId,
          title: n.title.trim(),
          content: n.content.trim(),
          color: typeof n.color === 'string' ? n.color : '#ffffff',
          tags: Array.isArray(n.tags) ? n.tags.filter((t: unknown) => typeof t === 'string') : [],
          isPinned: Boolean(n.isPinned),
          isArchived: Boolean(n.isArchived),
          isTrashed: Boolean(n.isTrashed),
        });
      }
    });

    if (validNotesToInsert.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid notes found in the imported file.',
      });
      return;
    }

    const createdNotes = await Note.insertMany(validNotesToInsert);

    publishNotesImported(userId.toString(), createdNotes.length);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdNotes.length} note(s).`,
      importedCount: createdNotes.length,
      data: createdNotes,
    });
  } catch (error) {
    console.error('Import notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import notes',
    });
  }
};