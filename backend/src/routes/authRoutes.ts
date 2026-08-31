import { Router } from 'express';
import { register, login, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.put('/change-password', protect, changePassword);
