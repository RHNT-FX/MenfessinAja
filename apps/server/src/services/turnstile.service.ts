import { ENV } from '../config/env.js';

export class TurnstileService {
  /**
   * Verifikasi token Cloudflare Turnstile (Sesuai SDD 4.2 Sequence Mengautentikasi Akun)
   */
  static async verify(token: string, remoteIp?: string): Promise<boolean> {
    // Development / Testing bypass jika menggunakan dummy token
    if (
      ENV.NODE_ENV === 'test' ||
      token === 'demo-turnstile-token' ||
      token === 'cf-dummy-token' ||
      token === 'mock-token' ||
      ENV.CLOUDFLARE_TURNSTILE_SECRET_KEY.startsWith('1x00000000000000000000')
    ) {
      return true;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', ENV.CLOUDFLARE_TURNSTILE_SECRET_KEY);
      formData.append('response', token);
      if (remoteIp) {
        formData.append('remoteip', remoteIp);
      }

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const outcome = (await response.json()) as { success: boolean; 'error-codes'?: string[] };
      return Boolean(outcome.success);
    } catch (error) {
      console.error('[TurnstileService] Gagal menghubungi layanan Cloudflare:', error);
      // Fallback toleran jika Cloudflare unreachable di dev
      return ENV.NODE_ENV !== 'production';
    }
  }
}
