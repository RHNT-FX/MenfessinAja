// =====================================================================
// REGEX SANITIZER UTILITY (NFR-002: Keberhasilan Penyamaran 100%)
// Menyamarkan NIM Kampus (1124xxxx) dan Nomor Telepon Seluler Indonesia
// =====================================================================

export interface SanitizationResult {
  sanitizedText: string;
  nimMaskedCount: number;
  phoneMaskedCount: number;
  totalMasked: number;
}

/**
 * Regex untuk mendeteksi NIM kampus:
 * Format 8 digit yang diawali dengan 1124 (misal: 11241059, 11240001, dll.)
 */
export const NIM_REGEX = /\b(1124)(\d{4})\b/g;

/**
 * Regex untuk mendeteksi nomor telepon seluler Indonesia:
 * Mendukung format:
 * - 08123456789, 0812-3456-7890, 0812 3456 7890
 * - +6281234567890, +62 812-3456-7890, 6281234567890
 */
export const PHONE_REGEX = /(?:\+?62|0)[\s.-]?8[1-9](?:[\s.-]?\d){7,10}\b/g;

/**
 * Menyamarkan NIM kampus menjadi format '1124****'
 */
export function maskNim(text: string): { text: string; count: number } {
  let count = 0;
  const masked = text.replace(NIM_REGEX, (_match, prefix) => {
    count++;
    return `${prefix}****`;
  });
  return { text: masked, count };
}

/**
 * Menyamarkan nomor telepon seluler Indonesia.
 * Menjaga 4 digit awal (misal 0812) dan 2 digit akhir, tengahnya disamarkan '****'.
 * Contoh: 08123456789 -> 0812****89, 0812-3456-7890 -> 0812****90
 */
export function maskPhone(text: string): { text: string; count: number } {
  let count = 0;
  const masked = text.replace(PHONE_REGEX, (rawMatch) => {
    // Hilangkan pemisah spasi, tanda hubung, atau titik
    const cleanDigits = rawMatch.replace(/[\s.-]/g, '');
    
    // Normalisasi prefix internasional (+62 / 62) ke 08 jika perlu untuk representasi lokal yang rapi
    let normalized = cleanDigits;
    if (normalized.startsWith('+62')) {
      normalized = '0' + normalized.slice(3);
    } else if (normalized.startsWith('62')) {
      normalized = '0' + normalized.slice(2);
    }

    if (normalized.length < 8) {
      return rawMatch; // Bukan nomor valid
    }

    count++;
    const prefix = normalized.slice(0, 4);
    const suffix = normalized.slice(-2);
    return `${prefix}****${suffix}`;
  });

  return { text: masked, count };
}

/**
 * Pipeline sanitasi gabungan:
 * Menjalankan penyamaran NIM dan nomor telepon sekaligus.
 */
export function sanitizeContent(content: string): SanitizationResult {
  if (!content) {
    return {
      sanitizedText: '',
      nimMaskedCount: 0,
      phoneMaskedCount: 0,
      totalMasked: 0,
    };
  }

  // 1. Sanitasi NIM
  const nimResult = maskNim(content);

  // 2. Sanitasi Nomor HP
  const phoneResult = maskPhone(nimResult.text);

  return {
    sanitizedText: phoneResult.text,
    nimMaskedCount: nimResult.count,
    phoneMaskedCount: phoneResult.count,
    totalMasked: nimResult.count + phoneResult.count,
  };
}
