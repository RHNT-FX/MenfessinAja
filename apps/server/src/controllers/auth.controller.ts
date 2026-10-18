import { LoginSchema, RegisterSchema } from '@menfessin-aja/shared';
import type { Context } from 'hono';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async register(c: Context) {
    const body = await c.req.json();
    const validated = RegisterSchema.parse(body);

    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for');
    const result = await AuthService.register({
      ...validated,
      remoteIp: clientIp
    });

    return c.json({
      success: true,
      message: 'Registrasi berhasil',
      data: result
    }, 201);
  }

  static async login(c: Context) {
    const body = await c.req.json();
    const validated = LoginSchema.parse(body);

    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for');
    const result = await AuthService.login({
      ...validated,
      remoteIp: clientIp
    });

    return c.json({
      success: true,
      message: 'Login berhasil',
      data: result
    }, 200);
  }

  static async me(c: Context) {
    const user = c.get('user');
    return c.json({
      success: true,
      data: { user }
    }, 200);
  }
}
