import { describe, expect, it } from 'vitest';
import { maskNim, maskPhone, sanitizeContent } from '../utils/sanitizer.js';

describe('Sprint 2: Regex Sanitizer Tests (NFR-002: 100% Akurasi)', () => {
  describe('NIM Masking (Format 1124xxxx)', () => {
    it('berhasil menyamarkan NIM mahasiswa 11241059 menjadi 1124****', () => {
      const input = 'Tolong hubungi NIM 11241059 untuk ambil kunci yang jatuh.';
      const result = maskNim(input);
      expect(result.text).toBe('Tolong hubungi NIM 1124**** untuk ambil kunci yang jatuh.');
      expect(result.count).toBe(1);
    });

    it('berhasil menyamarkan beberapa NIM dalam satu kalimat', () => {
      const input = 'Kelompok kami terdiri dari 11240001 dan 11249999.';
      const result = maskNim(input);
      expect(result.text).toBe('Kelompok kami terdiri dari 1124**** dan 1124****.');
      expect(result.count).toBe(2);
    });

    it('tidak menyamarkan angka non-NIM (bukan 8 digit atau bukan awalan 1124)', () => {
      const input = 'Kode pos 11240 atau angka 11251059 atau tahun 2026.';
      const result = maskNim(input);
      expect(result.text).toBe(input);
      expect(result.count).toBe(0);
    });
  });

  describe('Phone Number Masking (Format Seluler Indonesia)', () => {
    it('berhasil menyamarkan nomor 081234567890 menjadi 0812****90', () => {
      const input = 'Bisa WA ke 081234567890 ya.';
      const result = maskPhone(input);
      expect(result.text).toBe('Bisa WA ke 0812****90 ya.');
      expect(result.count).toBe(1);
    });

    it('berhasil menyamarkan nomor dengan tanda hubung (0812-3456-7890)', () => {
      const input = 'Kontak saya di 0812-3456-7890 segera.';
      const result = maskPhone(input);
      expect(result.text).toBe('Kontak saya di 0812****90 segera.');
      expect(result.count).toBe(1);
    });

    it('berhasil menyamarkan nomor format internasional (+6281234567890)', () => {
      const input = 'Nomor darurat: +6281234567890.';
      const result = maskPhone(input);
      expect(result.text).toBe('Nomor darurat: 0812****90.');
      expect(result.count).toBe(1);
    });

    it('berhasil menyamarkan nomor dengan spasi (+62 852 1234 5678)', () => {
      const input = 'Hubungi penjual di +62 852 1234 5678.';
      const result = maskPhone(input);
      expect(result.text).toBe('Hubungi penjual di 0852****78.');
      expect(result.count).toBe(1);
    });
  });

  describe('Pipeline Gabungan sanitizeContent', () => {
    it('menyamarkan NIM dan nomor HP sekaligus dalam satu postingan menfess', () => {
      const rawPost = 'Halo kak, aku 11241059 mau cari pemilik dompet. Hubungi aku di 0812-3456-7890!';
      const { sanitizedText, nimMaskedCount, phoneMaskedCount, totalMasked } = sanitizeContent(rawPost);

      expect(sanitizedText).toBe('Halo kak, aku 1124**** mau cari pemilik dompet. Hubungi aku di 0812****90!');
      expect(nimMaskedCount).toBe(1);
      expect(phoneMaskedCount).toBe(1);
      expect(totalMasked).toBe(2);
    });
  });
});
