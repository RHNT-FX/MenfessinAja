// =====================================================================
// SPRINT 4: TRANSACTION & MIDTRANS QRIS INTEGRATION TESTS
// Memverifikasi FR-004, FR-005, NFR-003, dan SDD 4.4
// =====================================================================

import { Hono } from 'hono';
import { beforeAll, describe, expect, it } from 'vitest';
import { ENV } from '../config/env.js';
import { PostRepository } from '../repositories/post.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { transactionsRouter } from '../routes/transactions.routes.js';
import { AuthService } from '../services/auth.service.js';
import { generateMidtransSignature, verifyMidtransSignature } from '../utils/midtrans.js';

describe('Sprint 4: Midtrans Snap QRIS & Monetization Tests (FR-004, FR-005, SDD 4.4)', () => {
  let app: Hono;
  let memberToken: string;
  let memberUser: any;
  let testPost: any;

  beforeAll(async () => {
    app = new Hono();
    app.route('/api/transactions', transactionsRouter);

    // Login sebagai member untuk mendapatkan token JWT
    const loginRes = await AuthService.login({
      email: 'student@menfessinaja.ac.id',
      password: 'password123',
      turnstile_token: 'valid-test-token'
    });
    memberToken = loginRes.token;
    memberUser = loginRes.user;

    // Buat satu postingan uji untuk ditautkan dengan transaksi
    testPost = await PostRepository.create({
      user_id: memberUser.id,
      kategori: 'menfess',
      teks_konten: 'Postingan untuk uji coba Superchat Midtrans QRIS',
      status: 'approved',
      ai_score: 0.05,
      is_boosted: false,
      upvotes_count: 0
    });
  });

  describe('1. Algoritma Kriptografi Signature SHA512 Midtrans', () => {
    it('berhasil memverifikasi signature sah dengan rumus SHA512(order_id + status_code + gross_amount + server_key)', () => {
      const orderId = 'ORDER-SUPERCHAT-12345';
      const statusCode = '200';
      const grossAmount = '5000.00';
      const serverKey = 'SB-Mid-server-test-secret';

      const validSignature = generateMidtransSignature(orderId, statusCode, grossAmount, serverKey);
      const isValid = verifyMidtransSignature(orderId, statusCode, grossAmount, serverKey, validSignature);

      expect(isValid).toBe(true);
    });

    it('menolak signature yang salah atau telah diubah (tampered payload)', () => {
      const orderId = 'ORDER-SUPERCHAT-12345';
      const statusCode = '200';
      const grossAmount = '5000.00';
      const serverKey = 'SB-Mid-server-test-secret';

      const fakeSignature = 'a8f87b897987efc8798d798a7sd8f7a9sd8f7';
      const isValid = verifyMidtransSignature(orderId, statusCode, grossAmount, serverKey, fakeSignature);

      expect(isValid).toBe(false);
    });
  });

  describe('2. Endpoint Checkout Transaksi (POST /api/transactions/checkout)', () => {
    it('menolak checkout jika belum login (401 Unauthorized)', async () => {
      const res = await app.request('/api/transactions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: testPost.id,
          feature_type: 'superchat',
          gross_amount: 5000
        })
      });

      expect(res.status).toBe(401);
    });

    it('berhasil membuat draf transaksi checkout dan menerima Snap Token (201 Created)', async () => {
      const res = await app.request('/api/transactions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`
        },
        body: JSON.stringify({
          post_id: testPost.id,
          feature_type: 'superchat',
          gross_amount: 5000
        })
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.orderId).toContain('ORDER-SUPERCHAT');
      expect(json.data.token).toBeDefined();
      expect(json.data.grossAmount).toBe(5000);

      // Verifikasi tersimpan di repository dengan status pending
      const savedTxn = await TransactionRepository.findByOrderId(json.data.orderId);
      expect(savedTxn).toBeDefined();
      expect(savedTxn?.status_pembayaran).toBe('pending');
      expect(savedTxn?.post_id).toBe(testPost.id);
    });
  });

  describe('3. Webhook Notifikasi Midtrans (POST /api/transactions/webhook)', () => {
    it('menerima notifikasi settlement yang sah dan mengaktifkan is_boosted pada postingan', async () => {
      // 1. Buat postingan dan checkout terlebih dahulu
      const postToBoost = await PostRepository.create({
        user_id: memberUser.id,
        kategori: 'menfess',
        teks_konten: 'Postingan yang akan di-boost oleh webhook',
        status: 'approved',
        ai_score: 0.05,
        is_boosted: false,
        upvotes_count: 0
      });

      const checkoutRes = await app.request('/api/transactions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`
        },
        body: JSON.stringify({
          post_id: postToBoost.id,
          feature_type: 'superchat',
          gross_amount: 5000
        })
      });

      const checkoutJson = await checkoutRes.json();
      const orderId = checkoutJson.data.orderId;

      // 2. Generate signature sah untuk webhook payload
      const statusCode = '200';
      const grossAmount = '5000.00';
      const signatureKey = generateMidtransSignature(
        orderId,
        statusCode,
        grossAmount,
        ENV.MIDTRANS_SERVER_KEY
      );

      // 3. Panggil webhook handler
      const webhookRes = await app.request('/api/transactions/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          status_code: statusCode,
          gross_amount: grossAmount,
          signature_key: signatureKey,
          transaction_status: 'settlement',
          fraud_status: 'accept',
          payment_type: 'qris'
        })
      });

      expect(webhookRes.status).toBe(200);
      const webhookJson = await webhookRes.json();
      expect(webhookJson.success).toBe(true);
      expect(webhookJson.data.status).toBe('settlement');
      expect(webhookJson.data.isBoosted).toBe(true);

      // 4. Pastikan postingan sekarang berstatus is_boosted = true!
      const updatedPost = await PostRepository.findById(postToBoost.id);
      expect(updatedPost?.is_boosted).toBe(true);
    });

    it('memperbarui status transaksi menjadi expire jika pembayaran kedaluwarsa', async () => {
      const postForExpire = await PostRepository.create({
        user_id: memberUser.id,
        kategori: 'marketplace',
        teks_konten: 'Barang marketplace yang expired pembayarannya',
        status: 'approved',
        ai_score: 0.02,
        is_boosted: false,
        upvotes_count: 0
      });

      const checkoutRes = await app.request('/api/transactions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`
        },
        body: JSON.stringify({
          post_id: postForExpire.id,
          feature_type: 'boost_listing',
          gross_amount: 5000
        })
      });

      const checkoutJson = await checkoutRes.json();
      const orderId = checkoutJson.data.orderId;

      const signatureKey = generateMidtransSignature(
        orderId,
        '202',
        '5000.00',
        ENV.MIDTRANS_SERVER_KEY
      );

      const webhookRes = await app.request('/api/transactions/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          status_code: '202',
          gross_amount: '5000.00',
          signature_key: signatureKey,
          transaction_status: 'expire'
        })
      });

      expect(webhookRes.status).toBe(200);
      const txn = await TransactionRepository.findByOrderId(orderId);
      expect(txn?.status_pembayaran).toBe('expire');

      // Postingan tetap tidak di-boost
      const post = await PostRepository.findById(postForExpire.id);
      expect(post?.is_boosted).toBe(false);
    });
  });

  describe('4. Polling Status & Simulasi Pembayaran Offline', () => {
    it('mengambil status transaksi melalui endpoint polling GET /api/transactions/:orderId/status', async () => {
      const checkoutRes = await app.request('/api/transactions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`
        },
        body: JSON.stringify({
          post_id: testPost.id,
          feature_type: 'superchat',
          gross_amount: 5000
        })
      });

      const checkoutJson = await checkoutRes.json();
      const orderId = checkoutJson.data.orderId;

      const statusRes = await app.request(`/api/transactions/${orderId}/status`, {
        headers: { Authorization: `Bearer ${memberToken}` }
      });

      expect(statusRes.status).toBe(200);
      const statusJson = await statusRes.json();
      expect(statusJson.success).toBe(true);
      expect(statusJson.data.transaction.midtrans_order_id).toBe(orderId);
      expect(statusJson.data.transaction.status_pembayaran).toBe('pending');
    });

    it('berhasil melakukan simulasi pembayaran offline instan POST /api/transactions/:orderId/simulate', async () => {
      const unboostedPost = await PostRepository.create({
        user_id: memberUser.id,
        kategori: 'menfess',
        teks_konten: 'Postingan untuk simulasi presentasi offline',
        status: 'approved',
        ai_score: 0.05,
        is_boosted: false,
        upvotes_count: 0
      });

      const checkoutRes = await app.request('/api/transactions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`
        },
        body: JSON.stringify({
          post_id: unboostedPost.id,
          feature_type: 'superchat',
          gross_amount: 5000
        })
      });

      const checkoutJson = await checkoutRes.json();
      const orderId = checkoutJson.data.orderId;

      const simRes = await app.request(`/api/transactions/${orderId}/simulate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${memberToken}` }
      });

      expect(simRes.status).toBe(200);
      const simJson = await simRes.json();
      expect(simJson.success).toBe(true);
      expect(simJson.data.status).toBe('settlement');
      expect(simJson.data.isBoosted).toBe(true);

      // Verifikasi postingan langsung ter-boost!
      const verifiedPost = await PostRepository.findById(unboostedPost.id);
      expect(verifiedPost?.is_boosted).toBe(true);
    });
  });
});
