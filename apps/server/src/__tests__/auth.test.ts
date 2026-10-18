import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { AuthService } from '../services/auth.service.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
import { UserRepository } from '../repositories/user.repository.js';

describe('Sprint 1: Authentication & Authorization Tests', () => {
  it('berhasil login dengan akun demo member dan menerima token JWT', async () => {
    const result = await AuthService.login({
      email: 'student@menfessinaja.ac.id',
      password: 'password123',
      turnstile_token: 'demo-turnstile-token'
    });

    expect(result).toHaveProperty('token');
    expect(result.user.email).toBe('student@menfessinaja.ac.id');
    expect(result.user.role).toBe('member');
    expect(result.user.status).toBe('active');
  });

  it('gagal login bila password salah', async () => {
    await expect(
      AuthService.login({
        email: 'student@menfessinaja.ac.id',
        password: 'salah-password',
        turnstile_token: 'demo-turnstile-token'
      })
    ).rejects.toThrow('Kredensial tidak valid');
  });

  it('berhasil mendaftarkan akun baru (Register) dan menghasilkan JWT', async () => {
    const newEmail = `mhs_${Date.now()}@menfessinaja.ac.id`;
    const result = await AuthService.register({
      email: newEmail,
      password: 'secretPassword123',
      turnstile_token: 'demo-turnstile-token'
    });

    expect(result.user.email).toBe(newEmail);
    expect(result.user.role).toBe('member');
    expect(result.token).toBeDefined();

    // Verifikasi dapat login kembali
    const loginResult = await AuthService.login({
      email: newEmail,
      password: 'secretPassword123',
      turnstile_token: 'demo-turnstile-token'
    });
    expect(loginResult.user.id).toBe(result.user.id);
  });

  it('menolak registrasi jika email sudah terdaftar', async () => {
    await expect(
      AuthService.register({
        email: 'student@menfessinaja.ac.id',
        password: 'passwordBaru',
        turnstile_token: 'demo-turnstile-token'
      })
    ).rejects.toThrow('sudah terdaftar');
  });

  it('menolak login jika akun dalam status banned (SRS FR-007 & SDD 4.9)', async () => {
    const bannedEmail = `banned_${Date.now()}@menfessinaja.ac.id`;
    const bannedUser = await UserRepository.create({
      email: bannedEmail,
      password_hash: 'dummyhash',
      role: 'member',
      status: 'banned'
    });

    await expect(
      AuthService.login({
        email: bannedEmail,
        password: 'password123',
        turnstile_token: 'demo-turnstile-token'
      })
    ).rejects.toThrow('telah diblokir');
  });

  it('menguji middleware requireAuth dan requireAdmin pada aplikasi Hono', async () => {
    const app = new Hono();

    app.get('/protected', requireAuth, (c) => c.json({ ok: true }));
    app.get('/admin-only', requireAuth, requireAdmin, (c) => c.json({ admin: true }));

    // 1. Request tanpa header auth -> 401
    const resNoAuth = await app.request('/protected');
    expect(resNoAuth.status).toBe(401);

    // 2. Request dengan token member -> 200 di protected, 403 di admin-only
    const memberLogin = await AuthService.login({
      email: 'student@menfessinaja.ac.id',
      password: 'password123',
      turnstile_token: 'demo-turnstile-token'
    });

    const resMemberProtected = await app.request('/protected', {
      headers: { Authorization: `Bearer ${memberLogin.token}` }
    });
    expect(resMemberProtected.status).toBe(200);

    const resMemberAdmin = await app.request('/admin-only', {
      headers: { Authorization: `Bearer ${memberLogin.token}` }
    });
    expect(resMemberAdmin.status).toBe(403);

    // 3. Request dengan token admin -> 200 di admin-only
    const adminLogin = await AuthService.login({
      email: 'admin@menfessinaja.ac.id',
      password: 'password123',
      turnstile_token: 'demo-turnstile-token'
    });

    const resAdminAdmin = await app.request('/admin-only', {
      headers: { Authorization: `Bearer ${adminLogin.token}` }
    });
    expect(resAdminAdmin.status).toBe(200);
  });
});
