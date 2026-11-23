// =====================================================================
// ADMIN MODERATION SERVICE (SRS FR-006, FR-007, SDD 4.5, 4.8, 4.9)
// =====================================================================

import type { Post } from '@menfessin-aja/shared';
import { ModerationRepository, type ModerationLogEntity } from '../repositories/moderation.repository.js';
import { PostRepository } from '../repositories/post.repository.js';
import { UserRepository } from '../repositories/user.repository.js';

export interface ModeratePostInput {
  adminId: string;
  adminEmail?: string;
  postId: string;
  keputusan: 'approve' | 'reject';
  alasan?: string;
}

export class AdminService {
  /**
   * Mengambil antrean postingan berstatus flagged untuk dimoderasi
   */
  static async getFlaggedQueue(): Promise<Post[]> {
    const { posts } = await PostRepository.findAll({
      status: 'flagged',
      limit: 50,
    });
    return posts;
  }

  /**
   * Eksekusi keputusan moderasi (Approve / Reject) dan catat log audit permanen
   */
  static async moderatePost(input: ModeratePostInput): Promise<{ post: Post; log: ModerationLogEntity }> {
    const { adminId, adminEmail, postId, keputusan, alasan } = input;

    const post = await PostRepository.findById(postId);
    if (!post) {
      throw new Error('Postingan tidak ditemukan');
    }

    // Perbarui status postingan
    const newStatus = keputusan === 'approve' ? 'approved' : 'rejected';
    const updatedPost = await PostRepository.update(postId, {
      status: newStatus,
      extra_meta: {
        ...(post.extra_meta || {}),
        moderated_by: adminId,
        moderated_at: new Date().toISOString(),
        moderation_decision: keputusan,
        moderation_reason: alasan,
      },
    });

    if (!updatedPost) {
      throw new Error('Gagal memperbarui status postingan');
    }

    // Tulis ke audit log permanen (SRS 2.5)
    const log = await ModerationRepository.createLog({
      adminId,
      adminEmail,
      postId,
      keputusan,
      alasan,
      postSnippet: post.teks_konten.slice(0, 80),
    });

    return { post: updatedPost, log };
  }

  /**
   * Mengambil riwayat log audit moderasi
   */
  static async getAuditLogs(): Promise<ModerationLogEntity[]> {
    return ModerationRepository.getLogs(30);
  }

  /**
   * Memblokir akun pengguna pelanggar (User Ban)
   */
  static async banUser(input: { adminId: string; adminEmail?: string; userId: string; alasan: string }) {
    const { adminId, adminEmail, userId, alasan } = input;

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Pengguna tidak ditemukan');
    }

    if (user.role === 'admin') {
      throw new Error('Tidak dapat memblokir sesama akun Administrator');
    }

    const updatedUser = await UserRepository.updateStatus(userId, 'banned');

    // Catat log tindakan ban
    await ModerationRepository.createLog({
      adminId,
      adminEmail,
      postId: '00000000-0000-0000-0000-000000000000',
      keputusan: 'reject',
      alasan: `[USER BAN] Akun ${user.email} diblokir. Alasan: ${alasan}`,
      postSnippet: `Pemblokiran akun pengguna: ${user.email}`,
    });

    return updatedUser;
  }

  /**
   * Mengambil statistik ringkas dasbor admin
   */
  static async getDashboardStats() {
    const { total: flaggedCount } = await PostRepository.findAll({ status: 'flagged', limit: 1 });
    const { total: approvedCount } = await PostRepository.findAll({ status: 'approved', limit: 1 });
    const logs = await ModerationRepository.getLogs(100);

    return {
      flagged_count: flaggedCount,
      approved_count: approvedCount,
      total_audits: logs.length,
      system_status: 'Operasional normal',
    };
  }
}
