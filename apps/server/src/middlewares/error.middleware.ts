import type { Context } from 'hono';
import { ZodError } from 'zod';

export function errorHandler(err: Error, c: Context) {
  console.error('[API Error]:', err);

  if (err instanceof ZodError) {
    return c.json({
      success: false,
      message: 'Validasi input gagal',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    }, 400);
  }

  return c.json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada peladen'
  }, 500);
}
