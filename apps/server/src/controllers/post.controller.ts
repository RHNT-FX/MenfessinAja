// =====================================================================
// POST CONTROLLER - MENFESSIN AJA
// Menangani request HTTP untuk linimasa, kirim menfess, vote, & komentar
// =====================================================================

import { CreateCommentSchema, CreateMenfessSchema } from '@menfessin-aja/shared';
import type { Context } from 'hono';
import { PostService } from '../services/post.service.js';

export class PostController {
  /**
   * GET /api/posts
   * Mengambil daftar postingan publik
   */
  static async getPosts(c: Context) {
    try {
      const kategori = (c.req.query('kategori') as any) || 'menfess';
      const page = Math.max(1, Number(c.req.query('page')) || 1);
      const limit = Math.min(50, Math.max(1, Number(c.req.query('limit')) || 20));
      const search = c.req.query('search') || '';

      const user = c.get('user');
      const userId = user?.id;

      const result = await PostService.getPosts({
        kategori,
        page,
        limit,
        search,
        userId,
      });

      return c.json({
        success: true,
        data: {
          items: result.posts,
          total: result.total,
          page,
          limit,
          has_more: page * limit < result.total,
        },
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal memuat postingan' }, 500);
    }
  }

  /**
   * POST /api/posts/menfess
   * Mengirim menfess anonim baru
   */
  static async createMenfess(c: Context) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json({ success: false, error: 'Otentikasi diperlukan' }, 401);
      }

      const body = await c.req.json();
      const parseResult = CreateMenfessSchema.safeParse(body);
      if (!parseResult.success) {
        return c.json({
          success: false,
          error: parseResult.error.errors[0]?.message || 'Input menfess tidak valid',
        }, 400);
      }

      const { teks_konten } = parseResult.data;
      const categoryPill = typeof body.category_pill === 'string' ? body.category_pill : 'Curhat';
      const isSuperchat = Boolean(body.is_superchat);

      const result = await PostService.createMenfess({
        userId: user.id,
        teksKonten: teks_konten,
        categoryPill,
        isSuperchat,
      });

      if (result.wasFlagged) {
        return c.json({
          success: true,
          flagged: true,
          message: 'Menfess Anda terdeteksi memerlukan moderasi dan sedang ditinjau oleh admin.',
          data: result.post,
        }, 202);
      }

      return c.json({
        success: true,
        flagged: false,
        message: 'Menfess berhasil dikirim dan ditayangkan!',
        data: result.post,
      }, 201);
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal mengirim menfess' }, 500);
    }
  }

  /**
   * POST /api/posts/:id/vote
   * Memberikan upvote / downvote
   */
  static async votePost(c: Context) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json({ success: false, error: 'Otentikasi diperlukan' }, 401);
      }

      const postId = c.req.param('id');
      const body = await c.req.json();
      const voteType = body.type === 'down' ? 'down' : 'up';

      const result = await PostService.votePost(postId, user.id, voteType);

      return c.json({
        success: true,
        message: 'Vote berhasil diperbarui',
        data: result,
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal memproses vote' }, 400);
    }
  }

  /**
   * GET /api/posts/:id/comments
   * Mengambil komentar pada postingan
   */
  static async getComments(c: Context) {
    try {
      const postId = c.req.param('id');
      const comments = await PostService.getComments(postId);

      return c.json({
        success: true,
        data: comments,
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal memuat komentar' }, 500);
    }
  }

  /**
   * POST /api/posts/:id/comments
   * Menambahkan komentar baru ke postingan
   */
  static async createComment(c: Context) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json({ success: false, error: 'Otentikasi diperlukan' }, 401);
      }

      const postId = c.req.param('id');
      const body = await c.req.json();
      const parseResult = CreateCommentSchema.safeParse(body);
      if (!parseResult.success) {
        return c.json({
          success: false,
          error: parseResult.error.errors[0]?.message || 'Isi komentar tidak valid',
        }, 400);
      }

      const comment = await PostService.addComment(postId, user.id, parseResult.data.isi_komentar);

      return c.json({
        success: true,
        message: 'Komentar berhasil ditambahkan',
        data: comment,
      }, 201);
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal menambahkan komentar' }, 500);
    }
  }
}
