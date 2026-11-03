// =====================================================================
// POSTS ROUTES - MENFESSIN AJA
// =====================================================================

import { Hono } from 'hono';
import { PostController } from '../controllers/post.controller.js';
import { optionalAuth, requireAuth } from '../middlewares/auth.middleware.js';

export const postsRouter = new Hono();

// Feed linimasa publik (optional auth untuk status vote)
postsRouter.get('/', optionalAuth, PostController.getPosts);

// Kirim menfess (wajib login)
postsRouter.post('/menfess', requireAuth, PostController.createMenfess);

// Vote postingan (wajib login)
postsRouter.post('/:id/vote', requireAuth, PostController.votePost);

// Komentar
postsRouter.get('/:id/comments', PostController.getComments);
postsRouter.post('/:id/comments', requireAuth, PostController.createComment);
