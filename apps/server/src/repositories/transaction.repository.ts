// =====================================================================
// TRANSACTION REPOSITORY - MENFESSIN AJA (Sprint 4)
// Abstraksi basis data Supabase & In-Memory Fallback untuk Transaksi QRIS
// =====================================================================

import type { Transaction, TransactionStatus } from '@menfessin-aja/shared';
import { isSupabaseConfigured, supabase } from '../config/supabase.js';

// In-memory mock store untuk pengujian dan demo offline
const mockTransactions = new Map<string, Transaction>();

export class TransactionRepository {
  /**
   * Menyimpan transaksi baru (status: 'pending')
   */
  static async create(
    data: Omit<Transaction, 'id' | 'created_at'>
  ): Promise<Transaction> {
    const id = `txn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const created_at = new Date().toISOString();

    const transaction: Transaction = {
      id,
      created_at,
      ...data
    };

    mockTransactions.set(transaction.midtrans_order_id, transaction);

    if (isSupabaseConfigured) {
      try {
        const { data: dbData, error } = await supabase
          .from('transactions')
          .insert({
            user_id: data.user_id,
            post_id: data.post_id,
            midtrans_order_id: data.midtrans_order_id,
            gross_amount: data.gross_amount,
            status_pembayaran: data.status_pembayaran
          })
          .select()
          .single();

        if (!error && dbData) {
          return {
            ...transaction,
            id: dbData.id,
            created_at: dbData.created_at
          };
        }
      } catch (err) {
        console.warn('[TransactionRepository] Gagal menyimpan ke Supabase, menggunakan memori:', err);
      }
    }

    return transaction;
  }

  /**
   * Mencari transaksi berdasarkan midtrans_order_id
   */
  static async findByOrderId(orderId: string): Promise<Transaction | null> {
    if (mockTransactions.has(orderId)) {
      return mockTransactions.get(orderId)!;
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('midtrans_order_id', orderId)
          .single();

        if (!error && data) {
          const txn: Transaction = {
            id: data.id,
            user_id: data.user_id,
            post_id: data.post_id,
            midtrans_order_id: data.midtrans_order_id,
            gross_amount: Number(data.gross_amount),
            status_pembayaran: data.status_pembayaran as TransactionStatus,
            created_at: data.created_at
          };
          mockTransactions.set(orderId, txn);
          return txn;
        }
      } catch (err) {
        console.warn('[TransactionRepository] Query orderId gagal:', err);
      }
    }

    return null;
  }

  /**
   * Mengambil daftar transaksi berdasarkan post_id
   */
  static async findByPostId(postId: string): Promise<Transaction[]> {
    const list: Transaction[] = [];
    for (const txn of mockTransactions.values()) {
      if (txn.post_id === postId) {
        list.push(txn);
      }
    }
    return list;
  }

  /**
   * Memperbarui status pembayaran transaksi ('settlement', 'expire', 'cancel')
   */
  static async updateStatus(
    orderId: string,
    status: TransactionStatus,
    paymentType?: string
  ): Promise<Transaction | null> {
    const txn = await this.findByOrderId(orderId);
    if (!txn) return null;

    txn.status_pembayaran = status;
    if (paymentType) {
      txn.payment_type = paymentType;
    }

    mockTransactions.set(orderId, txn);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('transactions')
          .update({
            status_pembayaran: status
          })
          .eq('midtrans_order_id', orderId);
      } catch (err) {
        console.warn('[TransactionRepository] Gagal update status di Supabase:', err);
      }
    }

    return txn;
  }

  /**
   * Mengambil semua riwayat transaksi untuk Dashboard Admin
   */
  static async getAll(
    limit: number = 20,
    offset: number = 0
  ): Promise<{ items: Transaction[]; total: number }> {
    const all = Array.from(mockTransactions.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      items: all.slice(offset, offset + limit),
      total: all.length
    };
  }

  /**
   * Reset store untuk pengujian otomatis
   */
  static clearMock(): void {
    mockTransactions.clear();
  }
}
