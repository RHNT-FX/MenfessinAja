import { Hono } from 'hono';
import { beforeAll, describe, expect, it } from 'vitest';
import { PostRepository } from '../repositories/post.repository.js';
import { adminRouter } from '../routes/admin.routes.js';
import { AuthService } from '../services/auth.service.js';

describe('Sprint 5 / Admin Moderation Integration Tests (FR-006, FR-007, SDD 4.5, 4.8, 4.9)', () => {
  let app: Hono;
  let adminToken: string;
  let memberToken: string;
  let flaggedPostId: string;

  beforeAll(async () => {
    app = new Hono();
    app.route('/api/admin', adminRouter);

    // Login sebagai Admin
    const adminLogin = await AuthService.login({
      email: 'admin@menfessinaja.ac.id',
      password: 'password123',
      turnstile_token: 'valid-test-token',
    });
    adminToken = adminLogin.token;

    // Login sebagai Member
    const memberLogin = await AuthService.login({
      email: 'student@menfessinaja.ac.id',
      password: 'password123',
      turnstile_token: 'valid-test-token',
    });
    memberToken = memberLogin.token;

    // Buat post berstatus flagged untuk pengujian
    const testFlaggedPost = await PostRepository.create({
      user_id: memberLogin.user.id,
      kategori: 'menfess',
      teks_konten: 'Postingan toxic yang terdeteksi AI untuk diuji admin',
      media_url: null,
      ai_score: 0.88,
      status: 'flagged',
      is_boosted: false,
      upvotes_count: 0,
      extra_meta: {
        category_pill: 'Curhat',
        moderation_flags: ['profanity'],
      },
    });
    flaggedPostId = testFlaggedPost.id;
  });

  describe('Hak Akses Endpoint Admin', () => {
    it('menolak akses pengguna non-admin / member (403 Forbidden)', async () => {
      const res = await app.request('/api/admin/posts/flagged', {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      expect(res.status).toBe(403);
    });

    it('mengizinkan akses akun ber-role admin (200 OK)', async () => {
      const res = await app.request('/api/admin/posts/flagged', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      const found = json.data.find((p: any) => p.id === flaggedPostId);
      expect(found).toBeDefined();
    });
  });

  describe('Aksi Moderasi (Approve / Reject)', () => {
    it('berhasil menyetujui (approve) postingan dan mencatat audit log permanen', async () => {
      const res = await app.request('/api/admin/posts/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          post_id: flaggedPostId,
          keputusan: 'approve',
          alasan: 'Konteks percakapan aman setelah ditinjau manual',
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.post.status).toBe('approved');
      expect(json.data.log.keputusan).toBe('approve');

      // Verifikasi di repository bahwa status postingan berubah
      const updated = await PostRepository.findById(flaggedPostId);
      expect(updated?.status).toBe('approved');
    });

    it('berhasil mengambil riwayat log audit moderasi', async () => {
      const res = await app.request('/api/admin/logs', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].admin_email).toBe('admin@menfessinaja.ac.id');
    });
  });

  describe('Pemblokiran Pengguna (User Ban)', () => {
    it('admin dapat memblokir pengguna pelanggar dan menolak login selanjutnya', async () => {
      // Daftarkan akun baru khusus untuk di-ban
      const newUserRes = await AuthService.register({
        email: 'baduser@menfessinaja.ac.id',
        password: 'password123',
        turnstile_token: 'valid-test-token',
      });

      // Eksekusi Ban oleh Admin
      const banRes = await app.request('/api/admin/users/ban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          user_id: newUserRes.user.id,
          alasan: 'Pelanggaran berulang ujaran kebencian',
        }),
      });

      expect(banRes.status).toBe(200);
      const banJson = await banRes.json();
      expect(banJson.success).toBe(true);
      expect(banJson.data.status).toBe('banned');

      // Verifikasi user yang diblokir tidak bisa login lagi
      await expect(
        AuthService.login({
          email: 'baduser@menfessinaja.ac.id',
          password: 'password123',
          turnstile_token: 'valid-test-token',
        })
      ).rejects.toThrow(/diblokir/);
    });
  });
});
