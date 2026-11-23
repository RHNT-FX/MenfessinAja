<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import TurnstileWidget from '@/components/common/TurnstileWidget.vue';
import { useAuthStore } from '@/stores/auth';
import { apiFetch } from '@/utils/api';
import {
  Image as ImageIcon,
  Loader2,
  Search,
  X
} from 'lucide-vue-next';
import { compressImageToWebp } from '@/utils/imageCompressor';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface LostFoundItem {
  id: string;
  tipe: 'Ditemukan' | 'Hilang' | 'Selesai';
  title: string;
  location: string;
  time: string;
  description: string;
  image: string;
  actionText: string;
  isResolved: boolean;
}

const router = useRouter();
const authStore = useAuthStore();

const searchQuery = ref('');
const activeFilter = ref<'Semua' | 'Hilang' | 'Ditemukan' | 'Selesai'>('Semua');
const reportType = ref<'ditemukan' | 'hilang'>('ditemukan');

const formNamaBarang = ref('');
const formLokasi = ref('');
const formWaktu = ref('');
const formCiri = ref('');
const formWa = ref('');
const turnstileToken = ref('demo-turnstile-token');
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const formError = ref('');

// Form Validations
const formNamaBarangError = computed(() => {
  if (!formNamaBarang.value.trim()) return 'Nama barang wajib diisi';
  if (formNamaBarang.value.trim().length < 3) return 'Nama barang minimal 3 karakter';
  return '';
});

const formLokasiError = computed(() => {
  if (!formLokasi.value.trim()) return 'Lokasi kejadian wajib diisi';
  if (formLokasi.value.trim().length < 3) return 'Lokasi minimal 3 karakter';
  return '';
});

const formCiriError = computed(() => {
  if (!formCiri.value.trim()) return 'Ciri-ciri & keterangan wajib diisi';
  if (formCiri.value.trim().length < 5) return 'Ciri-ciri minimal 5 karakter';
  return '';
});

const formWaError = computed(() => {
  if (!formWa.value) return ''; // Opsional di lost & found
  if (!/^08\d{8,11}$/.test(formWa.value) && !/^628\d{8,11}$/.test(formWa.value)) {
    return 'Nomor WA harus angka diawali 08/628 (10-13 digit)';
  }
  return '';
});

const isFormValid = computed(() => {
  return !formNamaBarangError.value && !formLokasiError.value && !formCiriError.value && !formWaError.value;
});

// WebP image compression state (SRS 1.3.3 & NFR-001)
const imagePreview = ref('');
const imageCompressionInfo = ref<{ originalKb: number; compressedKb: number; reduction: number } | null>(null);
const isCompressing = ref(false);

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];
  isCompressing.value = true;
  try {
    const res = await compressImageToWebp(file, 100);
    imagePreview.value = res.dataUrl;
    imageCompressionInfo.value = {
      originalKb: res.originalSizeKb,
      compressedKb: res.compressedSizeKb,
      reduction: res.reductionPercentage
    };
  } catch (err: any) {
    alert(err.message || 'Gagal mengompresi gambar');
  } finally {
    isCompressing.value = false;
  }
}

function removeImage() {
  imagePreview.value = '';
  imageCompressionInfo.value = null;
}

const reports = ref<LostFoundItem[]>([]);
const isLoading = ref(false);
const errorMsg = ref('');

onMounted(() => {
  loadReports();
});

async function loadReports() {
  isLoading.value = true;
  errorMsg.value = '';
  try {
    const res = await apiFetch('/api/posts', {
      params: { kategori: 'lost_found' }
    });
    if (res.success && res.data?.items) {
      reports.value = res.data.items.map((item: any) => {
        const isResolved = item.status === 'resolved' || item.extra_meta?.is_resolved;
        const tipeRaw = item.extra_meta?.tipe_laporan === 'hilang' ? 'Hilang' : 'Ditemukan';
        const tipe = isResolved ? 'Selesai' : tipeRaw;

        return {
          id: item.id,
          tipe,
          title: item.extra_meta?.judul || 'Laporan Barang',
          location: item.extra_meta?.lokasi || 'Kampus',
          time: new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
          description: item.teks_konten,
          image: item.media_url || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=80',
          actionText: isResolved
            ? '✓ Sudah diselesaikan'
            : tipeRaw === 'Ditemukan'
            ? 'Ini mungkin punya saya ↗'
            : 'Saya menemukan barang ini ↗',
          isResolved
        };
      });
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal memuat laporan';
  } finally {
    isLoading.value = false;
  }
}

const filteredReports = computed(() => {
  return reports.value.filter((r) => {
    const matchFilter = activeFilter.value === 'Semua' || r.tipe === activeFilter.value;
    const matchSearch =
      !searchQuery.value ||
      r.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchFilter && matchSearch;
  });
});

async function handleSubmitReport() {
  if (!isFormValid.value) {
    formError.value = formNamaBarangError.value || formLokasiError.value || formCiriError.value || formWaError.value || 'Mohon lengkapi semua kolom wajib';
    return;
  }
  formError.value = '';

  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await apiFetch('/api/posts/lost_found', {
      method: 'POST',
      body: JSON.stringify({
        judul: formNamaBarang.value,
        lokasi: formLokasi.value,
        tipe_laporan: reportType.value,
        deskripsi: formCiri.value + (formWaktu.value ? ` (Waktu: ${formWaktu.value})` : ''),
        whatsapp: formWa.value,
        media_url: imagePreview.value || undefined
      })
    });

    if (res.success && res.data) {
      const newReport: LostFoundItem = {
        id: res.data.id,
        tipe: reportType.value === 'ditemukan' ? 'Ditemukan' : 'Hilang',
        title: formNamaBarang.value,
        location: formLokasi.value,
        time: 'Hari ini · Baru saja',
        description: res.data.teks_konten,
        image: res.data.media_url || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=80',
        actionText: reportType.value === 'ditemukan' ? 'Ini mungkin punya saya ↗' : 'Saya menemukan barang ini ↗',
        isResolved: false
      };
      reports.value.unshift(newReport);
      isSubmitted.value = true;

      // Reset form
      formNamaBarang.value = '';
      formLokasi.value = '';
      formWaktu.value = '';
      formCiri.value = '';
      formWa.value = '';
      removeImage();

      setTimeout(() => {
        isSubmitted.value = false;
      }, 3000);
    }
  } catch (err: any) {
    alert(err.message || 'Gagal mengirim laporan');
  } finally {
    isSubmitting.value = false;
  }
}

async function handleResolve(item: LostFoundItem) {
  try {
    const res = await apiFetch(`/api/posts/${item.id}/resolve`, {
      method: 'PUT'
    });
    if (res.success) {
      item.isResolved = true;
      item.tipe = 'Selesai';
      item.actionText = '✓ Sudah diselesaikan';
    }
  } catch (err: any) {
    alert(err.message || 'Gagal menandai laporan selesai');
  }
}
</script>

<template>
  <div class="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 w-full max-w-full">
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

      <!-- Loading State -->
      <div v-if="isLoading" class="p-12 text-center text-ink-muted text-xs flex flex-col items-center gap-2">
        <Loader2 class="w-5 h-5 animate-spin text-primary" />
        <span>Memuat papan barang hilang & ditemukan...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMsg" class="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm mb-4">
        {{ errorMsg }}
      </div>

      <!-- 2-Column Layout: Reports List (Left) & Create Form (Right) (Sesuai Figma 09) -->
      <div v-else class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <!-- Left: Reports Feed -->
        <div class="xl:col-span-7 space-y-4">
          <div class="flex items-center justify-between text-xs text-ink-muted font-medium mb-2">
            <span>{{ filteredReports.length }} laporan aktif</span>
            <button class="hover:text-ink flex items-center gap-1">
              <span>Terbaru</span>
              <span>↓</span>
            </button>
          </div>

          <!-- Empty State -->
          <div v-if="filteredReports.length === 0" class="p-12 text-center bg-surface border border-dashed border-border rounded-sm text-xs text-ink-muted">
            <p class="font-medium text-ink mb-1">Belum ada laporan barang di kategori ini.</p>
            <p>Jika kamu kehilangan atau menemukan barang di area kampus, buat laporan di form sebelah kanan.</p>
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
                      item.tipe === 'Ditemukan' ? 'bg-emerald-100 text-emerald-800' : '',
                      item.tipe === 'Hilang' ? 'bg-amber-100 text-amber-900' : '',
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
                  @click="handleResolve(item)"
                  class="font-semibold text-primary hover:underline text-xs cursor-pointer"
                >
                  {{ item.actionText }}
                </button>

                <button class="text-[11px] text-ink-muted hover:text-ink">
                  Laporkan
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- Right: Create Report Form (Sesuai Figma 09) -->
        <div class="xl:col-span-5 bg-surface border border-border p-6 rounded-sm shadow-xs sticky top-24">
          <div class="mb-4">
            <div class="text-[11px] font-semibold text-ink-muted tracking-wider uppercase mb-1">
              LAPORKAN SEKARANG
            </div>
            <h2 class="font-serif text-2xl text-ink font-normal">
              Kehilangan atau nemu barang?
            </h2>
            <p class="text-xs text-ink-muted mt-1 leading-relaxed">
              Tulis ciri yang jelas agar pemilik atau penemu mudah mengenali barang tersebut.
            </p>
          </div>

          <!-- Type Selector (Radio Toggle) -->
          <div class="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              @click="reportType = 'ditemukan'"
              class="py-2 px-3 text-xs font-bold rounded-sm border transition-colors flex items-center justify-center gap-1.5"
              :class="reportType === 'ditemukan' ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-ink hover:bg-surface-muted'"
            >
              <span>Saya menemukan</span>
            </button>
            <button
              type="button"
              @click="reportType = 'hilang'"
              class="py-2 px-3 text-xs font-bold rounded-sm border transition-colors flex items-center justify-center gap-1.5"
              :class="reportType === 'hilang' ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-ink hover:bg-surface-muted'"
            >
              <span>Saya kehilangan</span>
            </button>
          </div>

          <form @submit.prevent="handleSubmitReport" class="space-y-3.5 text-xs">
            <!-- Alert Banner jika ada error validasi -->
            <div v-if="formError" class="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
              {{ formError }}
            </div>

            <div>
              <label class="block font-semibold text-ink mb-1">Nama Barang *</label>
              <input
                v-model="formNamaBarang"
                type="text"
                required
                placeholder="Contoh: Dompet cokelat, Kunci motor..."
                class="w-full p-2.5 bg-surface border rounded-sm focus:outline-none transition-colors"
                :class="formNamaBarang && formNamaBarangError ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
              />
              <p v-if="formNamaBarang && formNamaBarangError" class="text-[11px] text-red-500 mt-1">
                {{ formNamaBarangError }}
              </p>
            </div>

            <div>
              <label class="block font-semibold text-ink mb-1">Lokasi kejadian *</label>
              <input
                v-model="formLokasi"
                type="text"
                required
                placeholder="Contoh: Kantin gedung A, Ruang baca perpus..."
                class="w-full p-2.5 bg-surface border rounded-sm focus:outline-none transition-colors"
                :class="formLokasi && formLokasiError ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
              />
              <p v-if="formLokasi && formLokasiError" class="text-[11px] text-red-500 mt-1">
                {{ formLokasiError }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-ink mb-1">Waktu (Opsional)</label>
                <input
                  v-model="formWaktu"
                  type="text"
                  placeholder="Contoh: Tadi siang 13.00"
                  class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink"
                />
              </div>
              <div>
                <label class="block font-semibold text-ink mb-1">No WA Kontak (Opsional)</label>
                <input
                  v-model="formWa"
                  @input="e => formWa = (e.target as HTMLInputElement).value.replace(/\D/g, '')"
                  type="tel"
                  maxlength="14"
                  inputmode="numeric"
                  placeholder="081234567890"
                  class="w-full p-2.5 bg-surface border rounded-sm focus:outline-none font-mono transition-colors"
                  :class="formWa && formWaError ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
                />
                <p v-if="formWa && formWaError" class="text-[11px] text-red-500 mt-1">
                  {{ formWaError }}
                </p>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-ink mb-1">Ciri-ciri & Keterangan Tambahan *</label>
              <textarea
                v-model="formCiri"
                rows="3"
                required
                placeholder="Ciri unik, warna, gantungan, atau tempat barang dititipkan..."
                class="w-full p-2.5 bg-surface border rounded-sm focus:outline-none transition-colors"
                :class="formCiri && formCiriError ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
              ></textarea>
              <p v-if="formCiri && formCiriError" class="text-[11px] text-red-500 mt-1">
                {{ formCiriError }}
              </p>
            </div>

            <!-- WebP Image Upload Section (SRS 1.3.3 & NFR-001) -->
            <div>
              <label class="block font-semibold text-ink mb-1">Foto Barang (Opsional)</label>
              <div v-if="imagePreview" class="relative w-full h-36 bg-canvas border border-border rounded-sm overflow-hidden mb-2">
                <img :src="imagePreview" alt="Preview WebP" class="w-full h-full object-cover" />
                <button
                  type="button"
                  @click="removeImage"
                  class="absolute top-2 right-2 p-1 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
                  title="Hapus foto"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
                <div v-if="imageCompressionInfo" class="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-xs shadow-xs">
                  ✓ WebP • {{ imageCompressionInfo.compressedKb }} KB (Hemat {{ imageCompressionInfo.reduction }}%)
                </div>
              </div>

              <div v-else>
                <label class="cursor-pointer border border-dashed border-border hover:border-ink/50 rounded-sm p-3 text-center block transition-colors bg-surface">
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileSelect"
                  />
                  <div class="flex flex-col items-center gap-1 text-ink-muted">
                    <Loader2 v-if="isCompressing" class="w-4 h-4 animate-spin text-primary" />
                    <ImageIcon v-else class="w-4 h-4 text-ink-muted" />
                    <span class="text-[11px] font-medium text-ink">
                      {{ isCompressing ? 'Mengompresi ke WebP...' : 'Pilih Foto Barang' }}
                    </span>
                    <span class="text-[10px] text-ink-muted">Otomatis WebP ≤100 KB</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Cloudflare Turnstile Verification Widget -->
            <TurnstileWidget v-model="turnstileToken" />

            <div v-if="isSubmitted" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-sm">
              ✓ Laporan berhasil dipublikasikan ke papan Lost & Found!
            </div>

            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
              <span>Publikasikan Laporan</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
