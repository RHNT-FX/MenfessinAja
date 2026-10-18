// =====================================================================
// SHARED VALIDATION SCHEMAS (Zod) - MENFESSIN AJA
// =====================================================================

import { z } from 'zod';

// 1. Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  turnstile_token: z.string().min(1, 'Validasi Turnstile anti-bot wajib diisi')
});

export const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  turnstile_token: z.string().min(1, 'Validasi Turnstile anti-bot wajib diisi')
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// 2. Post Schemas
export const CreateMenfessSchema = z.object({
  teks_konten: z.string().min(5, 'Menfess minimal 5 karakter').max(2000, 'Menfess maksimal 2000 karakter')
});

export const CreateMarketplaceSchema = z.object({
  judul: z.string().min(3, 'Judul barang minimal 3 karakter').max(150),
  deskripsi: z.string().min(10, 'Deskripsi barang minimal 10 karakter'),
  harga: z.number().positive('Harga harus lebih dari 0'),
  whatsapp: z.string().regex(/^(?:\+62|62|0)8[1-9][0-9]{7,10}$/, 'Format nomor WhatsApp tidak valid'),
  kondisi: z.enum(['baru', 'bekas']).default('bekas'),
  media_url: z.string().url('URL media foto tidak valid')
});

export const CreateLostFoundSchema = z.object({
  judul: z.string().min(3, 'Judul minimal 3 karakter').max(150),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  tipe_laporan: z.enum(['hilang', 'ditemukan']),
  lokasi: z.string().min(3, 'Lokasi kejadian wajib diisi'),
  whatsapp: z.string().optional(),
  media_url: z.string().url().optional().nullable()
});

export const CreateCommentSchema = z.object({
  isi_komentar: z.string().min(1, 'Komentar tidak boleh kosong').max(1000, 'Komentar maksimal 1000 karakter')
});

// 3. Transaction Schemas
export const CheckoutTransactionSchema = z.object({
  post_id: z.string().uuid('ID Postingan tidak valid'),
  feature_type: z.enum(['superchat', 'boost_listing']),
  gross_amount: z.number().positive()
});

// 4. Admin Moderation Schemas
export const ModeratePostSchema = z.object({
  post_id: z.string().uuid('ID Postingan tidak valid'),
  keputusan: z.enum(['approve', 'reject']),
  alasan: z.string().optional()
});

export const BanUserSchema = z.object({
  user_id: z.string().uuid('ID User tidak valid'),
  alasan: z.string().min(5, 'Alasan pemblokiran minimal 5 karakter')
});
