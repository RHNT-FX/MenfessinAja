import type { User } from '@menfessin-aja/shared';
import type { Context, Next } from 'hono';
import { AuthService } from '../services/auth.service.js';

// Tipe konteks Hono dengan atribut user
export type AuthContext = Context<{
  Variables: {
    user: User;
  };
}>;

/**
 * Middleware untuk mewajibkan otentikasi JWT pada endpoint terproteksi
 */
export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      message: 'Akses ditolak: Token otentikasi (Bearer) tidak ditemukan'
    }, 401);
  }

  const token = authHeader.substring(7).trim();
  try {
    const user = await AuthService.verifyToken(token);
    c.set('user', user);
    await next();
  } catch (error: any) {
    return c.json({
      success: false,
      message: error.message || 'Token otentikasi tidak valid'
    }, 401);
  }
}

/**
 * Middleware untuk membatasi endpoint khusus Administrator (Sesuai SDD 1.2 & 6)
 */
export async function requireAdmin(c: Context, next: Next) {
  const user = c.get('user') as User | undefined;
  if (!user || user.role !== 'admin') {
    return c.json({
      success: false,
      message: 'Akses ditolak: Tindakan ini memerlukan hak akses Administrator'
    }, 403);
  }

  await next();
}
