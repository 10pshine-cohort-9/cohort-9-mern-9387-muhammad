import { Router } from 'express';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

export const noteRouter = Router();

// Protect all note routes with authentication middleware
noteRouter.use(protect);

noteRouter.route('/').get(getNotes).post(createNote);
noteRouter.route('/:id').get(getNoteById).put(updateNote).delete(deleteNote);
