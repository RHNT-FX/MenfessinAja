// =====================================================================
// POST SERVICE (Menfess, Sanitizer & AI Moderation Pipeline)
// Sesuai SRS FR-001, FR-003, NFR-002, dan SDD 4.3
// =====================================================================

import type { Comment, Post, PostCategory } from '@menfessin-aja/shared';
import { PostRepository, type PostWithMeta } from '../repositories/post.repository.js';
import { sanitizeContent } from '../utils/sanitizer.js';
import { AiModerationService, type ModerationResult } from './ai-moderation.service.js';

export interface CreateMenfessInput {
  userId: string;
  teksKonten: string;
  mediaUrl?: string | null;
  categoryPill?: string;
  isSuperchat?: boolean;
}

export interface CreateMenfessOutput {
  post: Post;
  wasFlagged: boolean;
  moderation: ModerationResult;
  sanitization: {
    nimMaskedCount: number;
    phoneMaskedCount: number;
  };
}

export class PostService {
  /**
   * Membuat postingan menfess baru melalui pipeline Sanitasi Regex dan Moderasi AI
   */
  static async createMenfess(input: CreateMenfessInput): Promise<CreateMenfessOutput> {
    const { userId, teksKonten, mediaUrl = null, categoryPill = 'Curhat', isSuperchat = false } = input;

    // 1. Tahap 1: Sanitasi Regex Lokal (NFR-002: 100% Akurasi Penyamaran NIM & No HP)
    const sanitization = sanitizeContent(teksKonten);
    const sanitizedText = sanitization.sanitizedText;

    // 2. Tahap 2: Moderasi AI NLP (Juan Router / Heuristic)
    const moderation = await AiModerationService.evaluateText(sanitizedText);

    // 3. Simpan ke database dengan status hasil evaluasi AI ('approved' atau 'flagged')
    const post = await PostRepository.create({
      user_id: userId,
      kategori: 'menfess',
      teks_konten: sanitizedText,
      media_url: mediaUrl,
      ai_score: moderation.aiScore,
      status: moderation.status,
      is_boosted: isSuperchat,
      upvotes_count: 0,
      extra_meta: {
        category_pill: categoryPill,
        is_superchat: isSuperchat,
        moderation_flags: moderation.flags,
      },
    });

    return {
      post,
      wasFlagged: !moderation.isSafe,
      moderation,
      sanitization: {
        nimMaskedCount: sanitization.nimMaskedCount,
        phoneMaskedCount: sanitization.phoneMaskedCount,
      },
    };
  }

  /**
   * Mengambil linimasa menfess approved
   */
  static async getPosts(options: {
    kategori?: PostCategory;
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
  }): Promise<{ posts: PostWithMeta[]; total: number }> {
    return PostRepository.findAll({
      ...options,
      status: 'approved',
    });
  }

  /**
   * Membuat listing marketplace C2C baru
   */
  static async createMarketplace(input: {
    userId: string;
    judul: string;
    deskripsi: string;
    harga: number;
    whatsapp: string;
    kondisi?: 'baru' | 'bekas';
    lokasi?: string;
    mediaUrl?: string;
    isBoosted?: boolean;
  }): Promise<Post> {
    const { userId, judul, deskripsi, harga, whatsapp, kondisi = 'bekas', lokasi = 'Sekitar kampus', mediaUrl, isBoosted = false } = input;
    const sanitizedDesc = sanitizeContent(deskripsi).sanitizedText;
    const sanitizedTitle = sanitizeContent(judul).sanitizedText;

    return PostRepository.create({
      user_id: userId,
      kategori: 'marketplace',
      teks_konten: sanitizedDesc,
      media_url: mediaUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
      ai_score: 0.01,
      status: 'approved',
      is_boosted: isBoosted,
      upvotes_count: 0,
      extra_meta: {
        judul: sanitizedTitle,
        harga,
        whatsapp,
        kondisi,
        lokasi,
        status_barang: 'Tersedia'
      }
    });
  }

  /**
   * Membuat laporan barang hilang / ditemukan (Lost and Found)
   */
  static async createLostFound(input: {
    userId: string;
    judul: string;
    deskripsi: string;
    tipeLaporan: 'hilang' | 'ditemukan';
    lokasi: string;
    whatsapp?: string;
    mediaUrl?: string;
  }): Promise<Post> {
    const { userId, judul, deskripsi, tipeLaporan, lokasi, whatsapp, mediaUrl } = input;
    const sanitizedDesc = sanitizeContent(deskripsi).sanitizedText;
    const sanitizedTitle = sanitizeContent(judul).sanitizedText;

    return PostRepository.create({
      user_id: userId,
      kategori: 'lost_found',
      teks_konten: sanitizedDesc,
      media_url: mediaUrl || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=80',
      ai_score: 0.01,
      status: 'approved',
      is_boosted: false,
      upvotes_count: 0,
      extra_meta: {
        judul: sanitizedTitle,
        tipe_laporan: tipeLaporan,
        lokasi,
        whatsapp: whatsapp || '',
        is_resolved: false
      }
    });
  }

  /**
   * Menandai postingan selesai / terjual (resolve)
   */
  static async resolvePost(postId: string): Promise<Post | null> {
    return PostRepository.update(postId, {
      status: 'resolved',
      extra_meta: {
        is_resolved: true,
        status_barang: 'Terjual'
      }
    });
  }

  /**
   * Vote postingan (up/down)
   */
  static async votePost(
    postId: string,
    userId: string,
    type: 'up' | 'down'
  ): Promise<{ upvotes_count: number; user_vote: 'up' | 'down' | null }> {
    return PostRepository.vote(postId, userId, type);
  }

  /**
   * Menambahkan komentar dengan sanitasi privasi
   */
  static async addComment(postId: string, userId: string, rawContent: string): Promise<Comment> {
    const { sanitizedText } = sanitizeContent(rawContent);
    return PostRepository.addComment(postId, userId, sanitizedText);
  }

  /**
   * Mengambil daftar komentar
   */
  static async getComments(postId: string): Promise<Comment[]> {
    return PostRepository.getComments(postId);
  }
}
