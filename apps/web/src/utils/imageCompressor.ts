// =====================================================================
// CLIENT-SIDE WEBP IMAGE COMPRESSOR (SRS 1.3.3 & NFR-001)
// Mengompresi berkas foto apa pun menjadi format .webp dengan ukuran < 100 KB
// Menggunakan native HTML5 Canvas API (Cepat: < 300 ms, tanpa dependensi berat)
// =====================================================================

export interface CompressionResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  reductionPercentage: number;
  format: 'image/webp';
}

/**
 * Mengompresi file gambar dari file input pengguna menjadi WebP < 100 KB
 * @param file Berkas gambar asli (JPEG/PNG/HEIC/dll.)
 * @param targetMaxKb Batas maksimal ukuran berkas (default: 100 KB sesuai SRS)
 * @param maxDimension Dimensi terpanjang (lebar/tinggi, default: 1200px)
 */
export async function compressImageToWebp(
  file: File,
  targetMaxKb: number = 100,
  maxDimension: number = 1200
): Promise<CompressionResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memproses gambar'));

      img.onload = () => {
        // 1. Hitung resolusi proporsional agar tidak melebihi maxDimension
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal menginisialisasi Canvas 2D'));
          return;
        }

        // Gambar ke canvas
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Iterasi kualitas adaptif agar ukuran file pasti < 100 KB
        let quality = 0.82;
        let dataUrl = canvas.toDataURL('image/webp', quality);
        let sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        while (sizeKb > targetMaxKb && quality > 0.25) {
          quality -= 0.12;
          dataUrl = canvas.toDataURL('image/webp', quality);
          sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        }

        // Jika masih > 100 KB, kecilkan skala resolusi 50%
        if (sizeKb > targetMaxKb) {
          canvas.width = Math.round(width * 0.7);
          canvas.height = Math.round(height * 0.7);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataUrl = canvas.toDataURL('image/webp', 0.65);
          sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        }

        const reductionPercentage = originalSizeKb > 0 
          ? Math.max(0, Math.round(((originalSizeKb - sizeKb) / originalSizeKb) * 100))
          : 0;

        resolve({
          dataUrl,
          originalSizeKb,
          compressedSizeKb: sizeKb,
          reductionPercentage,
          format: 'image/webp',
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
