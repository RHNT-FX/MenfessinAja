import { Hono } from 'hono';
import { beforeAll, describe, expect, it } from 'vitest';
import { postsRouter } from '../routes/posts.routes.js';
import { AuthService } from '../services/auth.service.js';

describe('Sprint 2: Post & Menfess Feed Integration Tests (FR-001, FR-003, NFR-002)', () => {
  let app: Hono;
  let memberToken: string;

  beforeAll(async () => {
    app = new Hono();
    app.route('/api/posts', postsRouter);

    // Dapatkan token member
    const loginRes = await AuthService.login({
      email: 'student@menfessinaja.ac.id',
      password: 'password123',
      turnstile_token: 'valid-test-token',
    });
    memberToken = loginRes.token;
  });

  describe('GET /api/posts', () => {
    it('berhasil memuat feed menfess publik dan menampilkan postingan pinned di urutan teratas', async () => {
      const res = await app.request('/api/posts?kategori=menfess');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data.items)).toBe(true);
      expect(json.data.items.length).toBeGreaterThan(0);

      // Postingan pertama harus yang berstatus is_boosted (pinned/superchat)
      const firstPost = json.data.items[0];
      expect(firstPost.is_boosted).toBe(true);
    });
  });

  describe('POST /api/posts/menfess', () => {
    it('menolak pengiriman menfess jika belum login (401 Unauthorized)', async () => {
      const res = await app.request('/api/posts/menfess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teks_konten: 'Halo ini tes tanpa token' }),
      });

      expect(res.status).toBe(401);
    });

    it('berhasil mengirim menfess aman dan langsung berstatus approved (201 Created)', async () => {
      const res = await app.request('/api/posts/menfess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${memberToken}`,
        },
        body: JSON.stringify({
          teks_konten: 'Semangat kawan-kawan yang besok presentasi tugas akhir di lab!',
          category_pill: 'Akademik',
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.flagged).toBe(false);
      expect(json.data.status).toBe('approved');
      expect(json.data.ai_score).toBeLessThan(0.70);
    });

    it('otomatis menyamarkan NIM dan nomor HP dalam konten menfess (NFR-002)', async () => {
      const res = await app.request('/api/posts/menfess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${memberToken}`,
        },
        body: JSON.stringify({
          teks_konten: 'Saya NIM 11241059 menemukan flashdisk, silakan hubungi 081234567890.',
          category_pill: 'Info kampus',
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.teks_konten).toContain('1124****');
      expect(json.data.teks_konten).toContain('0812****90');
      expect(json.data.teks_konten).not.toContain('11241059');
      expect(json.data.teks_konten).not.toContain('081234567890');
    });

    it('menahan menfess toxic/ancaman ke antrean moderasi dengan status flagged (202 Accepted)', async () => {
      const res = await app.request('/api/posts/menfess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${memberToken}`,
        },
        body: JSON.stringify({
          teks_konten: 'Dasar bajingan bangsat lu dekan!',
          category_pill: 'Curhat',
        }),
      });

      expect(res.status).toBe(202);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.flagged).toBe(true);
      expect(json.data.status).toBe('flagged');
      expect(json.data.ai_score).toBeGreaterThanOrEqual(0.70);
    });
  });

  describe('POST /api/posts/:id/vote', () => {
    it('berhasil melakukan upvote pada postingan menfess', async () => {
      const initialPostId = '10000000-0000-0000-0000-000000000001';

      const res = await app.request(`/api/posts/${initialPostId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${memberToken}`,
        },
        body: JSON.stringify({ type: 'up' }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.user_vote).toBe('up');
      expect(typeof json.data.upvotes_count).toBe('number');
    });
  });

  describe('Komentar Berutas (Comments)', () => {
    const postId = '10000000-0000-0000-0000-000000000001';

    it('berhasil menambahkan komentar yang disanitasi', async () => {
      const res = await app.request(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${memberToken}`,
        },
        body: JSON.stringify({
          isi_komentar: 'Keren kak, kontak saya di 0852-1234-5678 ya!',
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.isi_komentar).toContain('0852****78');
    });

    it('berhasil mengambil daftar komentar pada postingan', async () => {
      const res = await app.request(`/api/posts/${postId}/comments`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
