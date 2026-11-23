// =====================================================================
// MIDTRANS UTILITY - MENFESSIN AJA (Sprint 4: FR-004, FR-005, SDD 4.4)
// =====================================================================

import crypto from 'node:crypto';
import { ENV } from '../config/env.js';

export interface SnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerEmail: string;
  itemName: string;
  itemPrice: number;
}

export interface SnapTransactionResult {
  token: string;
  redirectUrl: string;
  isMock: boolean;
}

/**
 * Validasi SHA512 Signature Key dari Webhook Midtrans
 * Rumus Resmi Midtrans: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  // Format desimal amount Midtrans: jika berakhiran .00 atau integer
  const cleanAmount = grossAmount.includes('.') ? grossAmount : `${grossAmount}.00`;
  const rawClean = grossAmount.replace(/\.00$/, '');

  const hashStandard = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${cleanAmount}${serverKey}`)
    .digest('hex');

  const hashRaw = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${rawClean}${serverKey}`)
    .digest('hex');

  return hashStandard === signatureKey || hashRaw === signatureKey;
}

/**
 * Menghasilkan SHA512 Signature Key untuk simulasi webhook / unit testing
 */
export function generateMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string
): string {
  const cleanAmount = grossAmount.includes('.') ? grossAmount : `${grossAmount}.00`;
  return crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${cleanAmount}${serverKey}`)
    .digest('hex');
}

/**
 * Memanggil Midtrans Snap API untuk membuat token transaksi QRIS
 * Memiliki fallback otomatis ke Mock Simulator jika offline / kunci demo
 */
export async function createSnapTransaction(
  params: SnapTransactionParams
): Promise<SnapTransactionResult> {
  const { orderId, grossAmount, customerEmail, itemName, itemPrice } = params;

  const isDemoKey =
    !ENV.MIDTRANS_SERVER_KEY ||
    ENV.MIDTRANS_SERVER_KEY.includes('demo') ||
    ENV.MIDTRANS_SERVER_KEY === 'SB-Mid-server-demo';

  // Jika kunci demo atau mode offline, gunakan token simulasi
  if (isDemoKey) {
    return {
      token: `snap-token-demo-${orderId}`,
      redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/demo-${orderId}`,
      isMock: true
    };
  }

  const endpoint = ENV.MIDTRANS_IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

  const authHeader = `Basic ${Buffer.from(`${ENV.MIDTRANS_SERVER_KEY}:`).toString('base64')}`;

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount
    },
    customer_details: {
      email: customerEmail
    },
    item_details: [
      {
        id: 'ITEM-BOOST',
        price: itemPrice,
        quantity: 1,
        name: itemName.slice(0, 50)
      }
    ],
    enabled_payments: ['qris', 'gopay', 'other_qris']
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn('[Midtrans] API error, beralih ke token simulator:', await response.text());
      return {
        token: `snap-token-demo-${orderId}`,
        redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/demo-${orderId}`,
        isMock: true
      };
    }

    const data = (await response.json()) as any;
    return {
      token: data.token,
      redirectUrl: data.redirect_url,
      isMock: false
    };
  } catch (err) {
    console.warn('[Midtrans] Tidak dapat menghubungi server Midtrans, fallback ke simulator:', err);
    return {
      token: `snap-token-demo-${orderId}`,
      redirectUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/demo-${orderId}`,
      isMock: true
    };
  }
}
