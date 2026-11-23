// =====================================================================
// TRANSACTION CONTROLLER - MENFESSIN AJA (Sprint 4: FR-004, FR-005)
// =====================================================================

import type { Context } from 'hono';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { TransactionService } from '../services/transaction.service.js';

export class TransactionController {
  /**
   * POST /api/transactions/checkout
   * Menerbitkan token Snap QRIS untuk Superchat / Boost Listing
   */
  static async checkout(c: Context) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json({ success: false, error: 'Otentikasi diperlukan' }, 401);
      }

      const body = await c.req.json();
      const postId = body.post_id;
      const featureType = body.feature_type === 'boost_listing' ? 'boost_listing' : 'superchat';
      const grossAmount = Number(body.gross_amount) || 5000;

      if (!postId) {
        return c.json({ success: false, error: 'post_id wajib disertakan' }, 400);
      }

      const result = await TransactionService.createCheckout({
        userId: user.id,
        userEmail: user.email,
        postId,
        featureType,
        grossAmount
      });

      return c.json(
        {
          success: true,
          message: 'Draf transaksi berhasil dibuat. Silakan selesaikan pembayaran.',
          data: result
        },
        201
      );
    } catch (err: any) {
      return c.json(
        {
          success: false,
          error: err.message || 'Gagal memproses checkout transaksi'
        },
        500
      );
    }
  }

  /**
   * POST /api/transactions/webhook
   * Callback notifikasi publik dari Midtrans
   */
  static async webhook(c: Context) {
    try {
      const body = await c.req.json();
      const result = await TransactionService.handleWebhook(body);

      return c.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (err: any) {
      return c.json(
        {
          success: false,
          error: err.message || 'Gagal memproses webhook Midtrans'
        },
        400
      );
    }
  }

  /**
   * GET /api/transactions/:orderId/status
   * Polling status pembayaran untuk client frontend
   */
  static async getStatus(c: Context) {
    try {
      const orderId = c.req.param('orderId') || '';
      const result = await TransactionService.getTransactionStatus(orderId);

      if (!result.transaction) {
        return c.json({ success: false, error: 'Transaksi tidak ditemukan' }, 404);
      }

      return c.json({
        success: true,
        data: result
      });
    } catch (err: any) {
      return c.json(
        {
          success: false,
          error: err.message || 'Gagal mengambil status transaksi'
        },
        500
      );
    }
  }

  /**
   * POST /api/transactions/:orderId/simulate
   * Simulasi pembayaran lunas (Development, Offline, & Live Demo)
   */
  static async simulatePayment(c: Context) {
    try {
      const orderId = c.req.param('orderId') || '';
      const result = await TransactionService.simulatePayment(orderId);

      return c.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (err: any) {
      return c.json(
        {
          success: false,
          error: err.message || 'Gagal melakukan simulasi pembayaran'
        },
        400
      );
    }
  }

  /**
   * GET /api/transactions
   * Log seluruh riwayat transaksi untuk Dashboard Admin
   */
  static async getAll(c: Context) {
    try {
      const page = Math.max(1, Number(c.req.query('page')) || 1);
      const limit = Math.min(50, Math.max(1, Number(c.req.query('limit')) || 20));
      const offset = (page - 1) * limit;

      const result = await TransactionRepository.getAll(limit, offset);

      return c.json({
        success: true,
        data: {
          items: result.items,
          total: result.total,
          page,
          limit,
          has_more: offset + limit < result.total
        }
      });
    } catch (err: any) {
      return c.json(
        {
          success: false,
          error: err.message || 'Gagal memuat log transaksi'
        },
        500
      );
    }
  }
}
