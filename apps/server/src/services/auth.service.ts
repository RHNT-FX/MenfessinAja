import type { User } from '@menfessin-aja/shared';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserRepository } from '../repositories/user.repository.js';
import { TurnstileService } from './turnstile.service.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  /**
   * Mendaftarkan pengguna baru (Member)
   */
  static async register(params: {
    email: string;
    password: string;
    turnstile_token: string;
    remoteIp?: string;
  }): Promise<{ user: User; token: string }> {
    // 1. Verifikasi Turnstile Human-Check (Sesuai SDD 4.2)
    const isHuman = await TurnstileService.verify(params.turnstile_token, params.remoteIp);
    if (!isHuman) {
      throw new Error('Verifikasi anti-bot Cloudflare gagal atau token kadaluarsa');
    }

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await UserRepository.findByEmail(params.email);
    if (existingUser) {
      throw new Error('Email tersebut sudah terdaftar pada sistem');
    }

    // 3. Hash Password dengan bcrypt (Salt rounds: 10)
    const password_hash = await bcrypt.hash(params.password, 10);

    // 4. Simpan Pengguna Baru
    const user = await UserRepository.create({
      email: params.email,
      password_hash,
      role: 'member',
      status: 'active'
    });

    // 5. Generate JWT Token
    const token = this.generateToken(user);

    const safeUser: User = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at
    };

    return { user: safeUser, token };
  }

  /**
   * Masuk / Autentikasi Pengguna (Sesuai SDD 4.2 Sequence)
   */
  static async login(params: {
    email: string;
    password: string;
    turnstile_token: string;
    remoteIp?: string;
  }): Promise<{ user: User; token: string }> {
    // 1. Verifikasi Turnstile
    const isHuman = await TurnstileService.verify(params.turnstile_token, params.remoteIp);
    if (!isHuman) {
      throw new Error('Verifikasi anti-bot Cloudflare gagal');
    }

    // 2. Cari data pengguna berdasarkan email
    const user = await UserRepository.findByEmail(params.email);
    if (!user) {
      throw new Error('Kredensial tidak valid: email atau kata sandi salah');
    }

    // 3. Cek Status Akun (Apakah di-ban oleh Admin)
    if (user.status === 'banned') {
      throw new Error('Akun Anda telah diblokir oleh administrator karena pelanggaran pedoman komunitas');
    }

    // 4. Verifikasi Password Hash
    const isPasswordValid = await bcrypt.compare(params.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Kredensial tidak valid: email atau kata sandi salah');
    }

    // 5. Generate JWT Token
    const token = this.generateToken(user);

    const safeUser: User = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at
    };

    return { user: safeUser, token };
  }

  /**
   * Helper pembuatan token JWT
   */
  static generateToken(user: { id: string; email: string; role: string }): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Verifikasi token JWT dan kembalikan profil user
   */
  static async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
      const user = await UserRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('Pengguna tidak ditemukan');
      }
      if (user.status === 'banned') {
        throw new Error('Sesi dibatalkan: akun telah diblokir');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        created_at: user.created_at
      };
    } catch (err: any) {
      throw new Error('Token otentikasi tidak valid atau telah kadaluarsa');
    }
  }
}
