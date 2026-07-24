import { Response } from 'express';
import mongoose from 'mongoose';
import { Note } from '../models/Note.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getNotes = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const notes = await Note.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notes' });
  }
};

export const getNoteById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    if (note.user.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this note',
      });
      return;
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res
        .status(400)
        .json({ success: false, message: 'Invalid note ID format' });
      return;
    }
    console.error('Get note error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch note' });
  }
};

export const createNote = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { title, content } = req.body;

    if (
      typeof title !== 'string' ||
      typeof content !== 'string' ||
      !title.trim() ||
      !content.trim()
    ) {
      res.status(400).json({
        success: false,
        message: 'Please provide valid title and content strings',
      });
      return;
    }

    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, message: 'Failed to create note' });
  }
};

export const updateNote = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { title, content } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    if (note.user.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to edit this note',
      });
      return;
    }

    if (typeof title === 'string' && title.trim()) note.title = title.trim();
    if (typeof content === 'string' && content.trim())
      note.content = content.trim();

    const updatedNote = await note.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res
        .status(400)
        .json({ success: false, message: 'Invalid note ID format' });
      return;
    }
    console.error('Update note error:', error);
    res.status(500).json({ success: false, message: 'Failed to update note' });
  }
};

export const deleteNote = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }
    const note = await Note.findById(req.params.id);

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    if (note.user.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note',
      });
      return;
    }
    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res
        .status(400)
        .json({ success: false, message: 'Invalid note ID format' });
      return;
    }
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete note' });
  }
};
