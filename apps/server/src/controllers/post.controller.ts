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
   * POST /api/posts/preview-moderation
   * Mengevaluasi teks secara instan untuk pratinjau sanitasi privasi & skor AI
   */
  static async previewModeration(c: Context) {
    try {
      const body = await c.req.json();
      const text = typeof body.teks_konten === 'string' ? body.teks_konten : '';

      const { sanitizeContent } = await import('../utils/sanitizer.js');
      const { AiModerationService } = await import('../services/ai-moderation.service.js');

      const sanitization = sanitizeContent(text);
      const moderation = await AiModerationService.evaluateText(sanitization.sanitizedText);

      return c.json({
        success: true,
        data: {
          originalText: text,
          sanitizedText: sanitization.sanitizedText,
          nimMaskedCount: sanitization.nimMaskedCount,
          phoneMaskedCount: sanitization.phoneMaskedCount,
          aiScore: moderation.aiScore,
          isSafe: moderation.isSafe,
          status: moderation.status,
          flags: moderation.flags,
          reason: moderation.reason,
        },
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal mengevaluasi teks' }, 500);
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
      const mediaUrl = typeof body.media_url === 'string' ? body.media_url : null;

      const result = await PostService.createMenfess({
        userId: user.id,
        teksKonten: teks_konten,
        mediaUrl,
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
   * POST /api/posts/marketplace
   * Pasang listing barang baru di Marketplace
   */
  static async createMarketplace(c: Context) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json({ success: false, error: 'Otentikasi diperlukan' }, 401);
      }

      const body = await c.req.json();
      if (!body.judul || !body.deskripsi || !body.harga) {
        return c.json({ success: false, error: 'Judul, deskripsi, dan harga wajib diisi' }, 400);
      }

      const post = await PostService.createMarketplace({
        userId: user.id,
        judul: String(body.judul),
        deskripsi: String(body.deskripsi),
        harga: Number(body.harga),
        whatsapp: String(body.whatsapp || '081234567890'),
        kondisi: body.kondisi === 'baru' ? 'baru' : 'bekas',
        lokasi: body.lokasi || 'Kampus',
        mediaUrl: body.media_url,
        isBoosted: Boolean(body.is_boosted)
      });

      return c.json({
        success: true,
        message: 'Barang berhasil dipasang di marketplace!',
        data: post
      }, 201);
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal memasang barang' }, 500);
    }
  }

  /**
   * POST /api/posts/lost_found
   * Buat laporan barang hilang / ditemukan
   */
  static async createLostFound(c: Context) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json({ success: false, error: 'Otentikasi diperlukan' }, 401);
      }

      const body = await c.req.json();
      if (!body.judul || !body.deskripsi || !body.lokasi) {
        return c.json({ success: false, error: 'Nama barang, lokasi, dan deskripsi wajib diisi' }, 400);
      }

      const post = await PostService.createLostFound({
        userId: user.id,
        judul: String(body.judul),
        deskripsi: String(body.deskripsi),
        tipeLaporan: body.tipe_laporan === 'hilang' ? 'hilang' : 'ditemukan',
        lokasi: String(body.lokasi),
        whatsapp: body.whatsapp,
        mediaUrl: body.media_url
      });

      return c.json({
        success: true,
        message: 'Laporan berhasil dibuat!',
        data: post
      }, 201);
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal membuat laporan' }, 500);
    }
  }

  /**
   * PUT /api/posts/:id/resolve
   * Tandai barang terjual atau laporan selesai
   */
  static async resolvePost(c: Context) {
    try {
      const postId = c.req.param('id');
      const updated = await PostService.resolvePost(postId);
      if (!updated) {
        return c.json({ success: false, error: 'Postingan tidak ditemukan' }, 404);
      }

      return c.json({
        success: true,
        message: 'Status postingan berhasil diperbarui menjadi selesai',
        data: updated
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal memperbarui status' }, 500);
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
