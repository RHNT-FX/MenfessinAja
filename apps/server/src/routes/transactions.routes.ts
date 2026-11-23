// =====================================================================
// TRANSACTIONS ROUTES - MENFESSIN AJA (Sprint 4: Midtrans QRIS)
// =====================================================================

import { Hono } from 'hono';
import { TransactionController } from '../controllers/transaction.controller.js';
import { requireAdmin, requireAuth } from '../middlewares/auth.middleware.js';

export const transactionsRouter = new Hono();

// 1. Checkout & Minta Token Snap QRIS (Wajib Login)
transactionsRouter.post('/checkout', requireAuth, TransactionController.checkout);

// 2. Webhook Callback Publik dari Midtrans (Publik - Diverifikasi dengan SHA512 Signature Key)
transactionsRouter.post('/webhook', TransactionController.webhook);

// 3. Polling Status Pembayaran Transaksi (Wajib Login)
transactionsRouter.get('/:orderId/status', requireAuth, TransactionController.getStatus);

// 4. Simulasi Bayar Lunas Langsung (Wajib Login - Untuk Pengujian Lokal & Presentasi)
transactionsRouter.post('/:orderId/simulate', requireAuth, TransactionController.simulatePayment);

// 5. Riwayat Seluruh Transaksi (Khusus Admin)
transactionsRouter.get('/', requireAuth, requireAdmin, TransactionController.getAll);
