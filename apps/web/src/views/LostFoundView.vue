<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import {
  CheckCircle2,
  Search,
  ShieldCheck
} from 'lucide-vue-next';
import { computed, ref } from 'vue';

const searchQuery = ref('');
const activeFilter = ref<'Semua' | 'Hilang' | 'Ditemukan' | 'Selesai'>('Semua');
const reportType = ref<'ditemukan' | 'hilang'>('ditemukan');

const formNamaBarang = ref('Kunci + gantungan bebek');
const formLokasi = ref('Kantin, meja dekat jendela');
const formWaktu = ref('12 Okt 2026 / 11.40 WIB');
const formCiri = ref('Gantungan bebek kuning. Sudah dititipkan di pos keamanan.');
const isSubmitted = ref(false);

const reports = ref([
  {
    id: 'lf-1',
    tipe: 'Ditemukan',
    title: 'Kunci + gantungan bebek',
    location: 'Kantin, meja dekat jendela',
    time: '12 Okt 2026 · 11.40',
    description: 'Ditemukan setelah jam makan siang. Sudah dititipkan di pos keamanan. Sebutkan ciri kunci saat mengambil.',
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=80',
    actionText: 'Ini mungkin punya saya ↗',
    isResolved: false
  },
  {
    id: 'lf-2',
    tipe: 'Hilang',
    title: 'Dompet cokelat kecil',
    location: 'Sekitar perpustakaan',
    time: '12 Okt 2026 · 09.00',
    description: 'Terakhir dipakai pagi tadi. Ada jahitan lepas di sudut. Kalau menemukan, kabari lewat laporan ini ya.',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&auto=format&fit=crop&q=80',
    actionText: 'Saya menemukan barang ini ↗',
    isResolved: false
  },
  {
    id: 'lf-3',
    tipe: 'Ditemukan',
    title: 'Botol minum biru',
    location: 'Ruang baca lantai 2',
    time: '11 Okt 2026 · 16.20',
    description: 'Masih ada airnya. Dititipkan ke petugas perpustakaan; tunjukkan bukti kepemilikan untuk mengambil.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80',
    actionText: 'Ini mungkin punya saya ↗',
    isResolved: false
  },
  {
    id: 'lf-4',
    tipe: 'Selesai',
    title: 'Earbuds dalam case putih',
    location: 'Taman kampus',
    time: '11 Okt 2026 · 14.10',
    description: 'Sudah kembali ke pemiliknya. Terima kasih yang ikut bantu sebarkan!',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80',
    actionText: '✓ Sudah kembali ke pemilik',
    isResolved: true
  }
]);

const filteredReports = computed(() => {
  return reports.value.filter(r => {
    const matchFilter = activeFilter.value === 'Semua' || r.tipe === activeFilter.value;
    const matchSearch = !searchQuery.value || r.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchFilter && matchSearch;
  });
});

function handleSubmitReport() {
  if (!formNamaBarang.value.trim()) return;

  const newReport = {
    id: `lf-${Date.now()}`,
    tipe: reportType.value === 'ditemukan' ? 'Ditemukan' : 'Hilang',
    title: formNamaBarang.value,
    location: formLokasi.value || 'Sekitar kampus',
    time: 'Hari ini · Baru saja',
    description: formCiri.value,
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=80',
    actionText: reportType.value === 'ditemukan' ? 'Ini mungkin punya saya ↗' : 'Saya menemukan barang ini ↗',
    isResolved: false
  };

  reports.value.unshift(newReport);
  isSubmitted.value = true;
  setTimeout(() => {
    isSubmitted.value = false;
  }, 2000);
}
</script>

<template>
  <div class="flex items-start gap-8">
    <!-- Left Sidebar (Sesuai Figma) -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 min-w-0">
      <!-- Header Section (Sesuai Figma 09) -->
      <div class="mb-6">
        <div class="text-[11px] font-semibold text-ink-muted tracking-wider uppercase mb-1">
          LOST & FOUND / SALING BANTU
        </div>
        <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight">
          Dicari. Ditemukan. Pulang.
        </h1>
        <p class="text-xs sm:text-sm text-ink-muted mt-1.5">
          Ketinggalan bukan berarti hilang selamanya. Cek papan ini dulu.
        </p>
      </div>

      <!-- Search Input Bar (Sesuai Figma) -->
      <div class="mb-5">
        <div class="relative w-full">
          <Search class="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari barang atau lokasi..."
            class="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink placeholder:text-ink-muted transition-colors"
          />
        </div>
      </div>

      <!-- Filter Categories Tabs (Sesuai Figma) -->
      <div class="flex items-center gap-6 border-b border-border pb-2.5 mb-5 text-xs font-medium">
        <button
          v-for="flt in ['Semua', 'Hilang', 'Ditemukan', 'Selesai']"
          :key="flt"
          @click="activeFilter = flt as any"
          class="pb-1 transition-colors"
          :class="activeFilter === flt ? 'text-ink font-bold border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          {{ flt }}
        </button>
      </div>

      <!-- 2-Column Layout: Reports List (Left) & Create Form (Right) (Sesuai Figma 09) -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <!-- Left: Reports Feed -->
        <div class="xl:col-span-7 space-y-4">
          <div class="flex items-center justify-between text-xs text-ink-muted font-medium mb-2">
            <span>{{ filteredReports.length }} laporan aktif</span>
            <button class="hover:text-ink flex items-center gap-1">
              <span>Terbaru</span>
              <span>↓</span>
            </button>
          </div>

          <!-- Report Cards List -->
          <article
            v-for="item in filteredReports"
            :key="item.id"
            class="bg-surface border border-border p-4 rounded-sm flex flex-col sm:flex-row gap-4 hover:border-ink/40 transition-colors"
          >
            <!-- Thumbnail Image -->
            <div class="w-full sm:w-36 h-36 shrink-0 bg-surface-muted rounded-xs overflow-hidden">
              <img
                :src="item.image"
                :alt="item.title"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Content -->
            <div class="flex-1 flex flex-col justify-between">
              <div>
                <div class="mb-1">
                  <span
                    class="px-2 py-0.5 rounded-xs font-bold text-[10px] uppercase"
                    :class="[
                      item.tipe === 'Ditemukan' ? 'bg-badge-foundBg text-badge-foundText' : '',
                      item.tipe === 'Hilang' ? 'bg-badge-lostBg text-badge-lostText' : '',
                      item.tipe === 'Selesai' ? 'bg-surface-muted text-ink-muted' : ''
                    ]"
                  >
                    {{ item.tipe }}
                  </span>
                </div>

                <h3 class="font-serif text-lg text-ink font-normal leading-snug mb-1">
                  {{ item.title }}
                </h3>

                <div class="text-xs font-semibold text-ink mb-1">
                  {{ item.location }}
                </div>

                <div class="text-[11px] text-ink-muted mb-2">
                  {{ item.time }}
                </div>

                <p class="text-xs text-ink leading-relaxed line-clamp-2">
                  {{ item.description }}
                </p>
              </div>

              <!-- Action Links -->
              <div class="flex items-center justify-between pt-3 mt-2 border-t border-border/40 text-xs">
                <span
                  v-if="item.isResolved"
                  class="text-[11px] font-semibold text-ink-muted"
                >
                  {{ item.actionText }}
                </span>
                <button
                  v-else
                  class="font-semibold text-primary hover:underline text-xs"
                >
                  {{ item.actionText }}
                </button>

                <button class="text-[11px] text-ink-muted hover:text-ink">
                  Laporkan
                </button>
              </div>
            </div>
          </article>

          <!-- Load More Button -->
          <div class="text-center pt-2">
            <button class="w-full py-2.5 bg-surface border border-border text-xs font-semibold text-ink hover:bg-surface-muted transition-colors rounded-sm inline-flex items-center justify-center gap-1.5">
              <span>Lihat laporan lainnya</span>
              <span>↓</span>
            </button>
          </div>
        </div>

        <!-- Right: Create Report Form (Sesuai Figma 09) -->
        <div class="xl:col-span-5 bg-surface border border-border p-5 rounded-sm space-y-4">
          <div>
            <h2 class="font-serif text-2xl text-ink font-normal mb-1">
              Bantu barang pulang.
            </h2>
            <p class="text-xs text-ink-muted leading-relaxed">
              Buat laporan baru. Jangan tampilkan identitas pada kartu, dokumen, atau layar perangkat.
            </p>
          </div>

          <!-- Type Selector: Ditemukan / Hilang -->
          <div class="flex items-center gap-6 border-b border-border pb-2 text-xs font-semibold">
            <button
              @click="reportType = 'ditemukan'"
              class="pb-1 transition-colors"
              :class="reportType === 'ditemukan' ? 'text-ink border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
            >
              Ditemukan
            </button>
            <button
              @click="reportType = 'hilang'"
              class="pb-1 transition-colors"
              :class="reportType === 'hilang' ? 'text-ink border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
            >
              Hilang
            </button>
          </div>

          <!-- Form Fields -->
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-ink mb-1">Nama barang *</label>
              <input
                v-model="formNamaBarang"
                type="text"
                class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink font-medium"
              />
            </div>

            <div>
              <label class="block font-semibold text-ink mb-1">
                {{ reportType === 'ditemukan' ? 'Lokasi ditemukan *' : 'Lokasi terakhir *' }}
              </label>
              <input
                v-model="formLokasi"
                type="text"
                class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink"
              />
            </div>

            <div>
              <label class="block font-semibold text-ink mb-1">Tanggal & waktu *</label>
              <input
                v-model="formWaktu"
                type="text"
                class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink font-mono text-[11px]"
              />
            </div>

            <!-- Photo Upload Box (WebP < 100 KB sesuai SRS & Figma) -->
            <div>
              <label class="block font-semibold text-ink mb-1">Foto barang</label>
              <div class="border border-border p-3 rounded-sm flex items-center gap-3 bg-canvas/40">
                <div class="w-12 h-12 bg-surface rounded-xs overflow-hidden border border-border shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1582139329536-e7284fece509?w=100&auto=format&fit=crop&q=80"
                    alt="kunci"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 text-[11px]">
                  <div class="font-bold text-ink">kunci.webp · 82 KB</div>
                  <div class="text-primary font-medium cursor-pointer hover:underline">
                    Ganti foto / Hapus lampiran
                  </div>
                  <div class="text-ink-muted text-[10px]">WebP otomatis · maksimal 100 KB</div>
                </div>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-ink mb-1">Ciri & tempat penitipan *</label>
              <textarea
                v-model="formCiri"
                rows="3"
                class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink text-xs leading-relaxed"
              ></textarea>
              <p class="text-[10px] text-ink-muted mt-1">
                Simpan satu ciri khusus untuk memverifikasi pemilik.
              </p>
            </div>

            <!-- Turnstile Placeholder -->
            <div class="p-3 bg-canvas border border-border rounded-sm flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <ShieldCheck class="w-4 h-4 text-primary" />
                <div>
                  <div class="font-semibold text-ink text-[11px]">Verifikasi manusia</div>
                  <div class="text-[10px] text-ink-muted">Cloudflare Turnstile · placeholder demo</div>
                </div>
              </div>
              <span class="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                <CheckCircle2 class="w-3.5 h-3.5" /> Terverifikasi
              </span>
            </div>

            <!-- Submit Button -->
            <button
              @click="handleSubmitReport"
              class="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-sm transition-all shadow-xs"
            >
              Kirim laporan untuk ditinjau
            </button>

            <div v-if="isSubmitted" class="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-sm">
              ✓ Laporan berhasil dikirim dan diverifikasi!
            </div>
          </div>

          <!-- Bottom Notice: Setelah barang kembali (Sesuai Figma 09) -->
          <div class="pt-4 border-t border-border space-y-3">
            <div class="p-3.5 bg-primary-soft rounded-xs text-xs text-ink leading-relaxed">
              <span class="font-bold text-primary block mb-0.5">Setelah barang kembali</span>
              Pemilik laporan bisa menandai Selesai. Cocokkan ciri barang secara privat sebelum serah terima.
            </div>

            <button class="w-full py-2 bg-surface border border-border text-ink hover:bg-surface-muted text-xs font-semibold rounded-sm transition-colors">
              Tandai laporan saya selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
