// =====================================================================
// SHARED TYPES - MENFESSIN AJA
// Berdasarkan: SRS & SDD
// =====================================================================

export type UserRole = 'member' | 'admin';
export type UserStatus = 'active' | 'banned' | 'suspended';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export type PostCategory = 'menfess' | 'marketplace' | 'lost_found';
export type PostStatus = 'approved' | 'flagged' | 'rejected' | 'resolved' | 'sold';

export interface PostExtraMeta {
  // Marketplace
  harga?: number;
  whatsapp?: string;
  kondisi?: 'baru' | 'bekas';
  // Lost & Found
  tipe_laporan?: 'hilang' | 'ditemukan';
  lokasi?: string;
  tanggal_kejadian?: string;
  [key: string]: unknown;
}

export interface Post {
  id: string;
  user_id: string;
  kategori: PostCategory;
  teks_konten: string;
  media_url?: string | null;
  ai_score: number;
  status: PostStatus;
  is_boosted: boolean;
  upvotes_count: number;
  extra_meta?: PostExtraMeta;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  isi_komentar: string;
  created_at: string;
}

export type TransactionStatus = 'pending' | 'settlement' | 'expire' | 'cancel';

export interface Transaction {
  id: string;
  user_id: string;
  post_id: string;
  midtrans_order_id: string;
  gross_amount: number;
  status_pembayaran: TransactionStatus;
  payment_type?: string;
  created_at: string;
}

export interface ModerationLog {
  id: string;
  admin_id: string;
  post_id: string;
  keputusan: 'approve' | 'reject';
  alasan?: string;
  created_at: string;
}

// Standard API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
