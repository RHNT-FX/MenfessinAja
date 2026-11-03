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
    const { userId, teksKonten, categoryPill = 'Curhat', isSuperchat = false } = input;

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
      media_url: null,
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
