// =====================================================================
// ADMIN CONTROLLER - MENFESSIN AJA
// Menangani aksi moderasi konten, audit log, dan pemblokiran pengguna
// =====================================================================

import { BanUserSchema, ModeratePostSchema } from '@menfessin-aja/shared';
import type { Context } from 'hono';
import { AdminService } from '../services/admin.service.js';

export class AdminController {
  /**
   * GET /api/admin/posts/flagged
   */
  static async getFlaggedPosts(c: Context) {
    try {
      const posts = await AdminService.getFlaggedQueue();
      return c.json({
        success: true,
        data: posts,
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal mengambil antrean moderasi' }, 500);
    }
  }

  /**
   * POST /api/admin/posts/moderate
   */
  static async moderatePost(c: Context) {
    try {
      const admin = c.get('user');
      const body = await c.req.json();
      const parseResult = ModeratePostSchema.safeParse(body);

      if (!parseResult.success) {
        return c.json({
          success: false,
          error: parseResult.error.errors[0]?.message || 'Input keputusan moderasi tidak valid',
        }, 400);
      }

      const { post_id, keputusan, alasan } = parseResult.data;

      const result = await AdminService.moderatePost({
        adminId: admin.id,
        adminEmail: admin.email,
        postId: post_id,
        keputusan,
        alasan,
      });

      return c.json({
        success: true,
        message: `Postingan berhasil di-${keputusan === 'approve' ? 'setujui dan ditayangkan' : 'tolak'}`,
        data: result,
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal memproses moderasi' }, 500);
    }
  }

  /**
   * GET /api/admin/logs
   */
  static async getAuditLogs(c: Context) {
    try {
      const logs = await AdminService.getAuditLogs();
      return c.json({
        success: true,
        data: logs,
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal mengambil log audit' }, 500);
    }
  }

  /**
   * POST /api/admin/users/ban
   */
  static async banUser(c: Context) {
    try {
      const admin = c.get('user');
      const body = await c.req.json();
      const parseResult = BanUserSchema.safeParse(body);

      if (!parseResult.success) {
        return c.json({
          success: false,
          error: parseResult.error.errors[0]?.message || 'Input pemblokiran akun tidak valid',
        }, 400);
      }

      const { user_id, alasan } = parseResult.data;

      const bannedUser = await AdminService.banUser({
        adminId: admin.id,
        adminEmail: admin.email,
        userId: user_id,
        alasan,
      });

      return c.json({
        success: true,
        message: `Akun pengguna ${bannedUser?.email} berhasil diblokir`,
        data: bannedUser,
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal memblokir pengguna' }, 400);
    }
  }

  /**
   * GET /api/admin/stats
   */
  static async getStats(c: Context) {
    try {
      const stats = await AdminService.getDashboardStats();
      return c.json({
        success: true,
        data: stats,
      });
    } catch (err: any) {
      return c.json({ success: false, error: err.message || 'Gagal mengambil statistik' }, 500);
    }
  }
}
