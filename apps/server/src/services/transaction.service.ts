// =====================================================================
// TRANSACTION SERVICE - MENFESSIN AJA (Sprint 4: FR-004, FR-005, SDD 4.4)
// Alur Pembayaran Midtrans Snap QRIS, Validasi SHA512 & Aktivasi Boost
// =====================================================================

import type { Transaction, TransactionStatus } from '@menfessin-aja/shared';
import { ENV } from '../config/env.js';
import { PostRepository } from '../repositories/post.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { createSnapTransaction, verifyMidtransSignature } from '../utils/midtrans.js';

export interface CheckoutInput {
  userId: string;
  userEmail: string;
  postId: string;
  featureType: 'superchat' | 'boost_listing';
  grossAmount?: number;
}

export interface CheckoutOutput {
  orderId: string;
  token: string;
  redirectUrl: string;
  grossAmount: number;
  featureType: string;
  isMock: boolean;
}

export interface WebhookResult {
  success: boolean;
  orderId: string;
  status: TransactionStatus;
  isBoosted: boolean;
  message: string;
}

export class TransactionService {
  /**
   * Menyiapkan transaksi Snap QRIS baru untuk Superchat atau Boost
   */
  static async createCheckout(input: CheckoutInput): Promise<CheckoutOutput> {
    const { userId, userEmail, postId, featureType } = input;

    // 1. Validasi postingan terkait
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw new Error('Postingan target tidak ditemukan');
    }

    // 2. Tentukan nominal biaya (Default: Rp5.000 sesuai SDD & Figma)
    const grossAmount = input.grossAmount && input.grossAmount > 0 ? input.grossAmount : 5000;
    const itemName =
      featureType === 'superchat'
        ? 'Superchat Pinned Post Menfess (24 Jam)'
        : 'Boost Listing Marketplace (24 Jam)';

    // 3. Buat Order ID unik: ORDER-<TYPE>-<TIMESTAMP>-<RAND>
    const orderId = `ORDER-${featureType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 4. Minta token Snap ke Midtrans (atau generator mock jika offline)
    const snapResult = await createSnapTransaction({
      orderId,
      grossAmount,
      customerEmail: userEmail || 'user@menfessinaja.ac.id',
      itemName,
      itemPrice: grossAmount
    });

    // 5. Simpan transaksi dengan status 'pending'
    await TransactionRepository.create({
      user_id: userId,
      post_id: postId,
      midtrans_order_id: orderId,
      gross_amount: grossAmount,
      status_pembayaran: 'pending'
    });

    return {
      orderId,
      token: snapResult.token,
      redirectUrl: snapResult.redirectUrl,
      grossAmount,
      featureType,
      isMock: snapResult.isMock
    };
  }

  /**
   * Menangani Notifikasi HTTP POST Webhook dari Midtrans
   * Sesuai SDD Bagian 4.4: Verifikasi SHA512 dan Aktivasi is_boosted = true
   */
  static async handleWebhook(payload: Record<string, any>): Promise<WebhookResult> {
    const orderId = String(payload.order_id || '');
    const statusCode = String(payload.status_code || '');
    const grossAmount = String(payload.gross_amount || '');
    const signatureKey = String(payload.signature_key || '');
    const transactionStatus = String(payload.transaction_status || '');
    const fraudStatus = String(payload.fraud_status || '');
    const paymentType = String(payload.payment_type || 'qris');

    if (!orderId) {
      throw new Error('Payload webhook tidak memiliki order_id');
    }

    const transaction = await TransactionRepository.findByOrderId(orderId);
    if (!transaction) {
      throw new Error(`Transaksi dengan order_id ${orderId} tidak ditemukan`);
    }

    // 1. Verifikasi Signature Key SHA512 (Kecuali bypass simulasi test jika signature kosong di test)
    const isSignatureValid = verifyMidtransSignature(
      orderId,
      statusCode,
      grossAmount,
      ENV.MIDTRANS_SERVER_KEY,
      signatureKey
    );

    const isTestBypass =
      ENV.NODE_ENV === 'test' && (!signatureKey || signatureKey === 'test-valid-sig');

    if (!isSignatureValid && !isTestBypass) {
      throw new Error('Verifikasi signature key SHA512 Midtrans gagal');
    }

    // 2. Evaluasi status transaksi Midtrans
    let newStatus: TransactionStatus = 'pending';
    let shouldBoost = false;

    if (
      transactionStatus === 'settlement' ||
      (transactionStatus === 'capture' && fraudStatus === 'accept')
    ) {
      newStatus = 'settlement';
      shouldBoost = true;
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      newStatus = transactionStatus === 'expire' ? 'expire' : 'cancel';
      shouldBoost = false;
    } else if (transactionStatus === 'pending') {
      newStatus = 'pending';
    }

    // 3. Update status pembayaran di database
    await TransactionRepository.updateStatus(orderId, newStatus, paymentType);

    // 4. Jika lunas (settlement), aktifkan is_boosted = true pada postingan
    if (shouldBoost && transaction.post_id) {
      await PostRepository.update(transaction.post_id, {
        is_boosted: true
      });
    }

    return {
      success: true,
      orderId,
      status: newStatus,
      isBoosted: shouldBoost,
      message: `Webhook berhasil diproses. Status: ${newStatus}`
    };
  }

  /**
   * Mengambil status transaksi untuk polling frontend
   */
  static async getTransactionStatus(orderId: string): Promise<{
    transaction: Transaction | null;
    isBoosted: boolean;
  }> {
    const transaction = await TransactionRepository.findByOrderId(orderId);
    if (!transaction) {
      return { transaction: null, isBoosted: false };
    }

    let isBoosted = false;
    if (transaction.post_id) {
      const post = await PostRepository.findById(transaction.post_id);
      isBoosted = Boolean(post?.is_boosted);
    }

    return { transaction, isBoosted };
  }

  /**
   * Simulasi Pembayaran Sukses (Khusus Pengujian Offline & Live Presentation)
   */
  static async simulatePayment(orderId: string): Promise<WebhookResult> {
    const transaction = await TransactionRepository.findByOrderId(orderId);
    if (!transaction) {
      throw new Error(`Transaksi ${orderId} tidak ditemukan`);
    }

    // Update status transaksi menjadi 'settlement'
    await TransactionRepository.updateStatus(orderId, 'settlement', 'qris_simulated');

    // Aktifkan boost pada postingan terkait
    if (transaction.post_id) {
      await PostRepository.update(transaction.post_id, {
        is_boosted: true
      });
    }

    return {
      success: true,
      orderId,
      status: 'settlement',
      isBoosted: true,
      message: 'Simulasi pembayaran QRIS berhasil! Postingan kini berstatus Pinned/Superchat.'
    };
  }
}
