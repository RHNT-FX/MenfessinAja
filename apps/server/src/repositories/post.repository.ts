// =====================================================================
// POST & COMMENT REPOSITORY
// Berdasarkan SDD 5 (Entity Relationship Diagram) & SRS NFR-001
// Mendukung Supabase Query & In-Memory Fallback untuk pengujian cepat
// =====================================================================

import type { Comment, Post, PostCategory, PostStatus } from '@menfessin-aja/shared';
import crypto from 'node:crypto';
import { isSupabaseConfigured, supabase } from '../config/supabase.js';

// In-Memory store untuk development/testing jika Supabase belum aktif
const mockPosts: Map<string, Post> = new Map();
const mockComments: Comment[] = [];
// Map untuk melacak user voting: key = `${postId}_${userId}`, value = 'up' | 'down'
const mockUserVotes: Map<string, 'up' | 'down'> = new Map();

// Seed initial post sesuai migration 001
const initialPinnedPost: Post = {
  id: '10000000-0000-0000-0000-000000000001',
  user_id: '00000000-0000-0000-0000-000000000002',
  kategori: 'menfess',
  teks_konten: 'Selamat datang di Menfessin Aja! Forum anonim resmi civitas kampus. Jaga etika dan hindari penyebaran data pribadi ya!',
  media_url: null,
  ai_score: 0.02,
  status: 'approved',
  is_boosted: true,
  upvotes_count: 42,
  extra_meta: {
    category_pill: 'Info kampus',
    is_superchat: true,
  },
  created_at: new Date('2026-10-18T08:00:00Z').toISOString(),
};

mockPosts.set(initialPinnedPost.id, initialPinnedPost);

// Tambahan post demo
const demoPost2: Post = {
  id: '10000000-0000-0000-0000-000000000002',
  user_id: '00000000-0000-0000-0000-000000000002',
  kategori: 'menfess',
  teks_konten: 'Buat yang tadi sore ketinggalan tumbler Corkcicle warna biru di Gedung Kuliah Bersama Lantai 3, udah dititip ke satpam ya!',
  media_url: null,
  ai_score: 0.01,
  status: 'approved',
  is_boosted: false,
  upvotes_count: 15,
  extra_meta: {
    category_pill: 'Curhat',
  },
  created_at: new Date(Date.now() - 3600000).toISOString(),
};
mockPosts.set(demoPost2.id, demoPost2);

// Seed komentar awal
mockComments.push({
  id: crypto.randomUUID(),
  post_id: initialPinnedPost.id,
  user_id: '00000000-0000-0000-0000-000000000001',
  isi_komentar: 'Keren banget platformnya, semoga makin bermanfaat buat anak kampus!',
  created_at: new Date(Date.now() - 1800000).toISOString(),
});

export interface FindPostsOptions {
  kategori?: PostCategory;
  status?: PostStatus;
  page?: number;
  limit?: number;
  search?: string;
  userId?: string; // Untuk menentukan user_has_voted
}

export interface PostWithMeta extends Post {
  comments_count: number;
  user_vote?: 'up' | 'down' | null;
}

export class PostRepository {
  /**
   * Membuat postingan baru
   */
  static async create(postData: Omit<Post, 'id' | 'created_at'>): Promise<Post> {
    const newPost: Post = {
      ...postData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          id: newPost.id,
          user_id: newPost.user_id,
          kategori: newPost.kategori,
          teks_konten: newPost.teks_konten,
          media_url: newPost.media_url,
          ai_score: newPost.ai_score,
          status: newPost.status,
          is_boosted: newPost.is_boosted,
          upvotes_count: newPost.upvotes_count,
          extra_meta: newPost.extra_meta,
          created_at: newPost.created_at,
        })
        .select()
        .single();

      if (error) {
        console.error('[PostRepository] Error creating post in Supabase:', error);
      } else if (data) {
        return data as Post;
      }
    }

    mockPosts.set(newPost.id, newPost);
    return newPost;
  }

  /**
   * Mengambil daftar postingan dengan filter kategori, pagination, & sorting
   * Urutan: is_boosted (Superchat/Pinned) selalu di atas, lalu created_at DESC
   */
  static async findAll(options: FindPostsOptions = {}): Promise<{ posts: PostWithMeta[]; total: number }> {
    const {
      kategori = 'menfess',
      status = 'approved',
      page = 1,
      limit = 20,
      search = '',
      userId,
    } = options;

    if (isSupabaseConfigured) {
      let query = supabase
        .from('posts')
        .select('*, comments(count)', { count: 'exact' })
        .eq('kategori', kategori)
        .eq('status', status)
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('teks_konten', `%${search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query.range(from, to);

      if (!error && data) {
        const posts: PostWithMeta[] = data.map((item: any) => ({
          ...item,
          comments_count: item.comments?.[0]?.count || 0,
          user_vote: userId ? mockUserVotes.get(`${item.id}_${userId}`) || null : null,
        }));
        return { posts, total: count || posts.length };
      }
    }

    // In-Memory Fallback
    let allPosts = Array.from(mockPosts.values());

    // Filter kategori
    if (kategori) {
      allPosts = allPosts.filter((p) => p.kategori === kategori);
    }

    // Filter status
    if (status) {
      allPosts = allPosts.filter((p) => p.status === status);
    }

    // Filter search keyword
    if (search) {
      const q = search.toLowerCase();
      allPosts = allPosts.filter((p) => p.teks_konten.toLowerCase().includes(q));
    }

    // Sorting: Pinned/Superchat (is_boosted) pertama, lalu waktu terbaru
    allPosts.sort((a, b) => {
      if (a.is_boosted && !b.is_boosted) return -1;
      if (!a.is_boosted && b.is_boosted) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const total = allPosts.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = allPosts.slice(startIndex, startIndex + limit);

    const postsWithMeta: PostWithMeta[] = paginatedItems.map((p) => {
      const commentsCount = mockComments.filter((c) => c.post_id === p.id).length;
      const userVote = userId ? mockUserVotes.get(`${p.id}_${userId}`) || null : null;
      return {
        ...p,
        comments_count: commentsCount,
        user_vote: userVote,
      };
    });

    return { posts: postsWithMeta, total };
  }

  /**
   * Mengambil post berdasarkan ID
   */
  static async findById(id: string): Promise<Post | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return data as Post;
      }
    }

    return mockPosts.get(id) || null;
  }

  /**
   * Melakukan upvote/downvote pada postingan
   */
  static async vote(
    postId: string,
    userId: string,
    type: 'up' | 'down'
  ): Promise<{ upvotes_count: number; user_vote: 'up' | 'down' | null }> {
    const post = await this.findById(postId);
    if (!post) {
      throw new Error('Postingan tidak ditemukan');
    }

    const voteKey = `${postId}_${userId}`;
    const currentVote = mockUserVotes.get(voteKey) || null;

    let delta = 0;
    let nextVote: 'up' | 'down' | null = null;

    if (currentVote === type) {
      // Pembatalan vote yang sama (toggle off)
      delta = type === 'up' ? -1 : 1;
      mockUserVotes.delete(voteKey);
      nextVote = null;
    } else if (currentVote) {
      // Pergantian dari up ke down atau sebaliknya
      delta = type === 'up' ? 2 : -2;
      mockUserVotes.set(voteKey, type);
      nextVote = type;
    } else {
      // Vote baru
      delta = type === 'up' ? 1 : -1;
      mockUserVotes.set(voteKey, type);
      nextVote = type;
    }

    const updatedCount = Math.max(0, (post.upvotes_count || 0) + delta);
    post.upvotes_count = updatedCount;
    mockPosts.set(post.id, post);

    if (isSupabaseConfigured) {
      await supabase
        .from('posts')
        .update({ upvotes_count: updatedCount })
        .eq('id', postId);
    }

    return { upvotes_count: updatedCount, user_vote: nextVote };
  }

  /**
   * Menambahkan komentar ke postingan
   */
  static async addComment(postId: string, userId: string, isiKomentar: string): Promise<Comment> {
    const comment: Comment = {
      id: crypto.randomUUID(),
      post_id: postId,
      user_id: userId,
      isi_komentar: isiKomentar,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          id: comment.id,
          post_id: comment.post_id,
          user_id: comment.user_id,
          isi_komentar: comment.isi_komentar,
          created_at: comment.created_at,
        })
        .select()
        .single();

      if (!error && data) {
        return data as Comment;
      }
    }

    mockComments.push(comment);
    return comment;
  }

  /**
   * Mengambil daftar komentar per postingan
   */
  static async getComments(postId: string): Promise<Comment[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data as Comment[];
      }
    }

    return mockComments
      .filter((c) => c.post_id === postId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
}
