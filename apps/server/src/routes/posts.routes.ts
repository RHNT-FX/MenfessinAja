// =====================================================================
// POSTS ROUTES - MENFESSIN AJA
// =====================================================================

import { Hono } from 'hono';
import { PostController } from '../controllers/post.controller.js';
import { optionalAuth, requireAuth } from '../middlewares/auth.middleware.js';

export const postsRouter = new Hono();

// Feed linimasa publik (optional auth untuk status vote)
postsRouter.get('/', optionalAuth, PostController.getPosts);

// Evaluasi teks instan untuk pratinjau AI & Sanitasi Privasi (bisa dipanggil saat ngetik)
postsRouter.post('/preview-moderation', PostController.previewModeration);

// Kirim menfess (wajib login)
postsRouter.post('/menfess', requireAuth, PostController.createMenfess);

// Marketplace (wajib login)
postsRouter.post('/marketplace', requireAuth, PostController.createMarketplace);

// Lost and Found (wajib login)
postsRouter.post('/lost_found', requireAuth, PostController.createLostFound);

// Tandai selesai / terjual (resolve)
postsRouter.put('/:id/resolve', requireAuth, PostController.resolvePost);

// Vote postingan (wajib login)
postsRouter.post('/:id/vote', requireAuth, PostController.votePost);

// Komentar
postsRouter.get('/:id/comments', PostController.getComments);
postsRouter.post('/:id/comments', requireAuth, PostController.createComment);
