import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const authRouter = new Hono();

// Publik
authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);

// Terproteksi dengan JWT
authRouter.get('/me', requireAuth, AuthController.me);
