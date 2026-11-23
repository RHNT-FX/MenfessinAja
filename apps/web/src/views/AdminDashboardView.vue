<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { apiFetch } from '@/utils/api';
import type { ModerationLog, Post, Transaction } from '@menfessin-aja/shared';
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  UserX
} from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';

const authStore = useAuthStore();

// Navigation & Tab state
const activeSection = ref<'queue' | 'logs' | 'users' | 'transactions'>('queue');
const activeCategoryFilter = ref<'semua' | 'menfess' | 'marketplace' | 'lost_found'>('semua');
const searchQuery = ref('');

// State data riil dari backend
const flaggedPosts = ref<Post[]>([]);
const auditLogs = ref<(ModerationLog & { admin_email?: string; post_snippet?: string })[]>([]);
const transactions = ref<Transaction[]>([]);
const selectedPost = ref<Post | null>(null);

const isLoadingQueue = ref(false);
const isLoadingLogs = ref(false);
const isLoadingTransactions = ref(false);
const isProcessing = ref(false);
const actionFeedback = ref<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

const decisionNote = ref('');

onMounted(() => {
  loadFlaggedQueue();
  loadAuditLogs();
  loadTransactions();
});

async function loadTransactions() {
  isLoadingTransactions.value = true;
  try {
    const res = await apiFetch('/api/transactions');
    if (res.success && res.data?.items) {
      transactions.value = res.data.items;
    }
  } catch (err) {
    console.error('Gagal memuat log transaksi:', err);
  } finally {
    isLoadingTransactions.value = false;
  }
}

async function loadFlaggedQueue() {
  isLoadingQueue.value = true;
  try {
    const res = await apiFetch('/api/admin/posts/flagged');
    if (res.success && Array.isArray(res.data)) {
      flaggedPosts.value = res.data;
      if (flaggedPosts.value.length > 0) {
        selectedPost.value = flaggedPosts.value[0];
        decisionNote.value = (selectedPost.value.extra_meta?.moderation_flags as string[])?.length
          ? `Terdeteksi indikasi: ${(selectedPost.value.extra_meta?.moderation_flags as string[]).join(', ')}`
          : 'Konten mencurigakan';
      } else {
        selectedPost.value = null;
        decisionNote.value = '';
      }
    }
  } catch (err: any) {
    showFeedback('danger', err.message || 'Gagal memuat antrean moderasi');
  } finally {
    isLoadingQueue.value = false;
  }
}

async function loadAuditLogs() {
  isLoadingLogs.value = true;
  try {
    const res = await apiFetch('/api/admin/logs');
    if (res.success && Array.isArray(res.data)) {
      auditLogs.value = res.data;
    }
  } catch (err) {
    console.error('Gagal memuat log audit:', err);
  } finally {
    isLoadingLogs.value = false;
  }
}

function selectPost(post: Post) {
  selectedPost.value = post;
  decisionNote.value = (post.extra_meta?.moderation_flags as string[])?.length
    ? `Terdeteksi indikasi: ${(post.extra_meta?.moderation_flags as string[]).join(', ')}`
    : 'Konten perlu ditinjau ulang';
}

function showFeedback(type: 'success' | 'danger' | 'info', message: string) {
  actionFeedback.value = { type, message };
  setTimeout(() => {
    actionFeedback.value = null;
  }, 4500);
}

// Eksekusi Moderasi (Approve / Reject)
async function handleModerate(keputusan: 'approve' | 'reject') {
  if (!selectedPost.value || isProcessing.value) return;

  isProcessing.value = true;
  const currentId = selectedPost.value.id;

  try {
    const res = await apiFetch('/api/admin/posts/moderate', {
      method: 'POST',
      body: JSON.stringify({
        post_id: currentId,
        keputusan,
        alasan: decisionNote.value || (keputusan === 'approve' ? 'Disetujui admin' : 'Ditolak karena melanggar pedoman')
      })
    });

    if (res.success) {
      showFeedback(
        keputusan === 'approve' ? 'success' : 'danger',
        keputusan === 'approve'
          ? `✓ Kiriman ${currentId.slice(0, 8)} disetujui dan langsung tayang di linimasa.`
          : `✕ Kiriman ${currentId.slice(0, 8)} ditolak dan dicatat di log audit permanen.`
      );

      // Hapus dari antrean lokal
      flaggedPosts.value = flaggedPosts.value.filter((p) => p.id !== currentId);
      selectedPost.value = flaggedPosts.value.length > 0 ? flaggedPosts.value[0] : null;

      // Segarkan audit log
      loadAuditLogs();
    }
  } catch (err: any) {
    showFeedback('danger', err.message || 'Gagal mengeksekusi moderasi');
  } finally {
    isProcessing.value = false;
  }
}

// Eksekusi Blokir Pengguna (User Ban)
async function handleBanUser() {
  if (!selectedPost.value || isProcessing.value) return;

  const confirmBan = confirm('Apakah Anda yakin ingin memblokir akun pemilik postingan ini secara permanen?');
  if (!confirmBan) return;

  isProcessing.value = true;
  const currentPost = selectedPost.value;

  try {
    const res = await apiFetch('/api/admin/users/ban', {
      method: 'POST',
      body: JSON.stringify({
        user_id: currentPost.user_id,
        alasan: decisionNote.value || 'Pelanggaran berat pedoman komunitas kampus'
      })
    });

    if (res.success) {
      showFeedback('danger', `⚠ Pengguna berhasil diblokir secara permanen dari sistem.`);
      // Sekaligus tolak postingan terkait
      await handleModerate('reject');
    }
  } catch (err: any) {
    showFeedback('danger', err.message || 'Gagal memblokir pengguna');
  } finally {
    isProcessing.value = false;
  }
}

// Filter antrean berdasarkan pencarian dan kategori
const filteredPosts = computed(() => {
  return flaggedPosts.value.filter((p) => {
    const matchCategory =
      activeCategoryFilter.value === 'semua' || p.kategori === activeCategoryFilter.value;
    const matchSearch =
      !searchQuery.value ||
      p.teks_konten.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchCategory && matchSearch;
  });
});

function formatTime(isoStr: string) {
  const date = new Date(isoStr);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
}
</script>

<template>
  <div class="flex items-start gap-8">
    <!-- Left Moderator Sidebar (Sesuai Figma 13) -->
    <aside class="w-60 shrink-0 hidden lg:flex flex-col gap-6 text-xs text-ink select-none pr-4">
      <div class="space-y-2.5">
        <div class="text-[11px] font-bold tracking-wider text-ink-muted uppercase">
          RUANG MODERATOR
        </div>
        <div class="space-y-1">
          <button
            @click="activeSection = 'queue'"
            class="w-full flex items-center justify-between px-3 py-2 rounded-sm text-left transition-colors font-semibold"
            :class="activeSection === 'queue' ? 'bg-primary-soft text-primary font-bold' : 'text-ink hover:bg-surface-muted'"
          >
            <div class="flex items-center gap-2.5">
              <ShieldAlert class="w-4 h-4" />
              <span>Antrean moderasi</span>
            </div>
            <span
              v-if="flaggedPosts.length > 0"
              class="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[10px] font-bold rounded-xs"
            >
              {{ flaggedPosts.length }}
            </span>
          </button>

          <button
            @click="activeSection = 'logs'"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-left transition-colors font-medium"
            :class="activeSection === 'logs' ? 'bg-primary-soft text-primary font-bold' : 'text-ink hover:bg-surface-muted'"
          >
            <FileText class="w-4 h-4" />
            <span>Log audit</span>
          </button>

          <button
            @click="activeSection = 'transactions'; loadTransactions()"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-left transition-colors font-medium"
            :class="activeSection === 'transactions' ? 'bg-primary-soft text-primary font-bold' : 'text-ink hover:bg-surface-muted'"
          >
            <CreditCard class="w-4 h-4" />
            <span>Transaksi QRIS</span>
          </button>
        </div>
      </div>

      <div class="border-t border-border"></div>

      <!-- Links (Sesuai Figma) -->
      <div class="space-y-2 text-xs text-ink-muted">
        <router-link to="/pedoman" class="block font-semibold text-ink hover:underline">
          Pedoman komunitas ↗
        </router-link>
        <router-link to="/bantuan" class="block hover:text-ink transition-colors">
          Bantuan & FAQ
        </router-link>
        <router-link to="/privasi" class="block hover:text-ink transition-colors">
          Kebijakan privasi
        </router-link>
      </div>

      <div class="text-[11px] text-ink-muted leading-relaxed mt-auto pt-4 border-t border-border">
        Administrator: <strong class="text-ink">{{ authStore.user?.email }}</strong><br />
        Setiap keputusan dicatat permanen di tabel audit log.
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 min-w-0 space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div class="text-[11px] font-semibold text-ink-muted tracking-wider uppercase mb-1">
            DASBOR MODERASI / ADMINISTRATOR
          </div>
          <div class="flex flex-wrap items-baseline gap-3">
            <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight">
              Ruang jaga komunitas.
            </h1>
            <span
              class="px-2.5 py-0.5 text-xs font-bold rounded-xs"
              :class="flaggedPosts.length > 0 ? 'bg-badge-superchatBg text-badge-superchatText' : 'bg-emerald-100 text-emerald-800'"
            >
              {{ flaggedPosts.length }} perlu tinjauan
            </span>
          </div>
          <p class="text-xs sm:text-sm text-ink-muted mt-1.5">
            Tinjau konten yang ditahan oleh sistem AI. Utamakan konteks, keamanan, dan jejak keputusan yang jelas.
          </p>
        </div>

        <button
          @click="loadFlaggedQueue(); loadAuditLogs()"
          class="bg-surface border border-border hover:bg-surface-muted text-ink text-xs font-semibold px-3 py-2 rounded-sm transition-all flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoadingQueue }" />
          <span>Segarkan Data</span>
        </button>
      </div>

      <!-- Action Feedback Banner -->
      <div
        v-if="actionFeedback"
        class="p-3.5 rounded-sm text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
        :class="[
          actionFeedback.type === 'success' ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' : '',
          actionFeedback.type === 'danger' ? 'bg-red-50 border border-red-300 text-red-800' : '',
          actionFeedback.type === 'info' ? 'bg-blue-50 border border-blue-300 text-blue-800' : ''
        ]"
      >
        <CheckCircle2 v-if="actionFeedback.type === 'success'" class="w-4 h-4 shrink-0" />
        <AlertTriangle v-else class="w-4 h-4 shrink-0" />
        <span>{{ actionFeedback.message }}</span>
      </div>

      <!-- Search Input -->
      <div class="relative w-full">
        <Search class="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari ID kiriman atau teks konten..."
          class="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink placeholder:text-ink-muted transition-colors"
        />
      </div>

      <!-- Filter Tabs Kategori (Sesuai Figma) -->
      <div class="flex items-center gap-6 border-b border-border pb-2.5 text-xs font-medium">
        <button
          @click="activeCategoryFilter = 'semua'"
          class="pb-1 transition-colors"
          :class="activeCategoryFilter === 'semua' ? 'text-ink font-bold border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          Semua antrean ({{ flaggedPosts.length }})
        </button>
        <button
          @click="activeCategoryFilter = 'menfess'"
          class="pb-1 transition-colors"
          :class="activeCategoryFilter === 'menfess' ? 'text-ink font-bold border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          Menfess
        </button>
        <button
          @click="activeCategoryFilter = 'marketplace'"
          class="pb-1 transition-colors"
          :class="activeCategoryFilter === 'marketplace' ? 'text-ink font-bold border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          Marketplace
        </button>
        <button
          @click="activeCategoryFilter = 'lost_found'"
          class="pb-1 transition-colors"
          :class="activeCategoryFilter === 'lost_found' ? 'text-ink font-bold border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          Lost & Found
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingQueue" class="p-12 text-center text-ink-muted text-xs flex flex-col items-center gap-2">
        <Loader2 class="w-5 h-5 animate-spin text-primary" />
        <span>Memuat antrean konten ditandai...</span>
      </div>

      <!-- EMPTY STATE JIKA SEMUA BERSIH -->
      <div
        v-else-if="filteredPosts.length === 0"
        class="p-12 text-center bg-surface border border-dashed border-border rounded-sm text-xs text-ink-muted space-y-2"
      >
        <CheckCircle2 class="w-8 h-8 text-emerald-600 mx-auto" />
        <h3 class="font-bold text-ink text-sm">Semua Antrean Bersih!</h3>
        <p>Tidak ada konten yang ditahan saat ini. Seluruh postingan komunitas kampus berstatus aman.</p>
      </div>

      <!-- Table & Review Workbench Layout (Sesuai Figma 13) -->
      <div v-else class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <!-- Left: Flagged Queue Table -->
        <div class="xl:col-span-7 space-y-4">
          <div class="flex items-center justify-between text-[11px] text-ink-muted font-medium">
            <span>Menunggu · Terlama dahulu ↓</span>
            <span>Evaluasi Juan Router AI NLP</span>
          </div>

          <!-- Table Container -->
          <div class="bg-surface border border-border rounded-sm overflow-hidden text-xs">
            <div class="grid grid-cols-12 gap-2 p-3 bg-canvas/60 border-b border-border font-bold text-ink-muted text-[11px] uppercase tracking-wider">
              <div class="col-span-6">KIRIMAN</div>
              <div class="col-span-3">INDIKASI</div>
              <div class="col-span-2 text-right">SKOR AI</div>
              <div class="col-span-1 text-right">WIB</div>
            </div>

            <div class="divide-y divide-border">
              <div
                v-for="item in filteredPosts"
                :key="item.id"
                @click="selectPost(item)"
                class="grid grid-cols-12 gap-2 p-3.5 hover:bg-canvas/50 transition-colors cursor-pointer items-center"
                :class="{ 'bg-primary-soft/50 font-medium': selectedPost?.id === item.id }"
              >
                <!-- Kiriman -->
                <div class="col-span-6">
                  <div class="text-[10px] text-ink-muted leading-tight mb-0.5">
                    {{ item.id.slice(0, 8) }} / {{ item.kategori }}
                  </div>
                  <div class="font-bold text-ink text-xs line-clamp-1">
                    “{{ item.teks_konten }}”
                  </div>
                </div>

                <!-- Alasan Indikasi -->
                <div class="col-span-3 font-medium text-xs text-badge-lostText truncate">
                  {{ (item.extra_meta?.moderation_flags as string[])?.join(', ') || 'Mencurigakan' }}
                </div>

                <!-- Skor AI -->
                <div class="col-span-2 text-right font-bold text-xs text-badge-lostText">
                  {{ Math.round((item.ai_score || 0) * 100) }}%
                </div>

                <!-- Waktu WIB -->
                <div class="col-span-1 text-right text-[11px] text-ink-muted font-mono">
                  {{ new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Detail Review Box (Sesuai Figma 13) -->
        <div v-if="selectedPost" class="xl:col-span-5 bg-surface border border-border p-5 rounded-sm space-y-4 shadow-xs sticky top-24">
          <div class="flex items-center justify-between text-xs">
            <span class="font-mono font-bold text-ink">ID: {{ selectedPost.id.slice(0, 13) }}...</span>
            <span class="px-2 py-0.5 bg-badge-superchatBg text-badge-superchatText font-bold text-[10px] rounded-xs uppercase">
              Ditahan · Skor {{ Math.round((selectedPost.ai_score || 0) * 100) }}%
            </span>
          </div>

          <h2 class="font-serif text-xl sm:text-2xl text-ink font-normal leading-snug">
            Tinjau konteks, bukan cuma skor.
          </h2>

          <div class="text-[11px] text-ink-muted space-y-0.5 pb-2 border-b border-border">
            <div>Kategori: <strong>{{ selectedPost.kategori }}</strong> · {{ formatTime(selectedPost.created_at) }}</div>
            <div>User ID internal: <code class="font-mono text-[10px]">{{ selectedPost.user_id }}</code></div>
          </div>

          <!-- Redacted / Flagged Text Box (Sesuai Figma) -->
          <div class="p-3.5 bg-badge-lostBg/60 border border-badge-lostText/20 rounded-xs space-y-1.5">
            <div class="text-[10px] font-bold text-badge-lostText tracking-wider uppercase flex items-center justify-between">
              <span>ISI TEKS KONTEN</span>
              <span>TERDETEKSI AI</span>
            </div>
            <p class="font-serif text-xs text-ink leading-relaxed whitespace-pre-line">
              {{ selectedPost.teks_konten }}
            </p>
          </div>

          <!-- Detection Points -->
          <div class="space-y-1.5 text-xs">
            <div class="font-bold text-badge-lostText text-[11px]">
              Indikasi Pelanggaran: {{ (selectedPost.extra_meta?.moderation_flags as string[])?.join(', ') || 'Toxic / Ujaran mencurigakan' }}
            </div>
            <div class="text-[11px] text-ink grid grid-cols-2 gap-2 pt-1 border-t border-border">
              <div>
                <span class="text-ink-muted block text-[10px]">Filter Regex:</span>
                <span class="font-medium text-emerald-700">Tersanitasi</span>
              </div>
              <div>
                <span class="text-ink-muted block text-[10px]">Probabilitas AI:</span>
                <span class="font-bold text-badge-lostText">{{ Math.round((selectedPost.ai_score || 0) * 100) }}%</span>
              </div>
            </div>
            <div class="text-[10px] text-ink-muted leading-normal pt-1">
              Skor AI adalah sinyal pemandu. Keputusan akhir mutlak ditentukan oleh Administrator.
            </div>
          </div>

          <!-- Decision Note Input -->
          <div>
            <label class="block text-xs font-semibold text-ink mb-1">Catatan keputusan / Alasan *</label>
            <textarea
              v-model="decisionNote"
              rows="2"
              placeholder="Tuliskan alasan persetujuan atau penolakan..."
              class="w-full p-2.5 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink leading-relaxed"
            ></textarea>
          </div>

          <!-- Action Buttons: Setujui / Tolak / Blokir (Sesuai Figma) -->
          <div class="flex items-center gap-2 pt-1">
            <button
              @click="handleModerate('approve')"
              :disabled="isProcessing"
              class="flex-1 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-xs font-semibold py-2.5 rounded-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <Loader2 v-if="isProcessing" class="w-3.5 h-3.5 animate-spin" />
              <span>Setujui</span>
            </button>
            <button
              @click="handleModerate('reject')"
              :disabled="isProcessing"
              class="flex-1 bg-badge-lostText hover:bg-red-800 active:scale-[0.99] text-white text-xs font-semibold py-2.5 rounded-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <Loader2 v-if="isProcessing" class="w-3.5 h-3.5 animate-spin" />
              <span>Tolak</span>
            </button>
            <button
              @click="handleBanUser"
              :disabled="isProcessing"
              class="px-3 py-2.5 bg-surface border border-badge-lostText text-badge-lostText hover:bg-badge-lostBg text-xs font-semibold rounded-sm transition-colors disabled:opacity-50"
              title="Blokir Akun Pengirim"
            >
              <UserX class="w-4 h-4" />
            </button>
          </div>

          <p class="text-[10px] text-ink-muted leading-tight">
            Menyetujui akan membuat postingan langsung tayang di linimasa. Menolak atau memblokir akun akan mencatat jejak audit permanen.
          </p>
        </div>
      </div>

      <!-- Bottom Tables: Log Audit Moderasi Riil (Sesuai Figma 13) -->
      <div class="pt-6 border-t border-border space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-serif text-xl text-ink font-normal">Riwayat Log Audit Moderasi</h3>
          <span class="text-xs text-ink-muted">{{ auditLogs.length }} tindakan tercatat</span>
        </div>

        <div v-if="auditLogs.length === 0" class="p-6 text-center text-xs text-ink-muted bg-surface border border-border rounded-sm">
          Belum ada riwayat tindakan moderasi.
        </div>

        <div v-else class="bg-surface border border-border rounded-sm divide-y divide-border text-xs">
          <div
            v-for="log in auditLogs"
            :key="log.id"
            class="p-3 flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <span class="font-mono text-ink-muted text-[11px] shrink-0">
                {{ formatTime(log.created_at) }}
              </span>
              <div>
                <div class="font-semibold text-ink text-xs flex items-center gap-2">
                  <span
                    class="px-1.5 py-0.2 rounded-xs text-[10px] font-bold uppercase"
                    :class="log.keputusan === 'approve' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ log.keputusan === 'approve' ? 'Disetujui' : 'Ditolak' }}
                  </span>
                  <span>{{ log.post_snippet ? `“${log.post_snippet}...”` : log.post_id }}</span>
                </div>
                <div class="text-[10px] text-ink-muted mt-0.5">
                  Admin: <strong>{{ log.admin_email }}</strong> · Catatan: {{ log.alasan }}
                </div>
              </div>
            </div>
            <span class="text-[10px] font-mono text-ink-muted shrink-0">
              ID: {{ log.id.slice(0, 8) }}
            </span>
          </div>
        </div>

        <!-- Info Box SRS 2.5 -->
        <div class="p-3.5 bg-primary-soft rounded-xs text-xs text-ink leading-relaxed">
          <span class="font-bold text-primary block mb-0.5">Catatan Audit Permanen (SRS 2.5)</span>
          Log tindakan moderasi tersimpan secara permanen untuk integritas transparansi dan tidak dapat dihapus sepihak.
        </div>
      </div>

      <!-- Transactions Log Section (Sprint 4: Midtrans QRIS) -->
      <div v-if="activeSection === 'transactions' || activeSection === 'queue'" class="pt-6 border-t border-border space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-serif text-xl text-ink font-normal flex items-center gap-2">
            <CreditCard class="w-5 h-5 text-primary" />
            <span>Riwayat Transaksi QRIS Midtrans</span>
          </h3>
          <span class="text-xs text-ink-muted">{{ transactions.length }} transaksi tercatat</span>
        </div>

        <div v-if="isLoadingTransactions" class="p-6 text-center text-xs text-ink-muted flex items-center justify-center gap-2">
          <Loader2 class="w-4 h-4 animate-spin text-primary" />
          <span>Memuat data transaksi...</span>
        </div>

        <div v-else-if="transactions.length === 0" class="p-6 text-center text-xs text-ink-muted bg-surface border border-border rounded-sm">
          Belum ada transaksi pembayaran QRIS yang tercatat.
        </div>

        <div v-else class="bg-surface border border-border rounded-sm overflow-hidden text-xs">
          <div class="grid grid-cols-12 gap-2 p-3 bg-canvas/60 border-b border-border font-bold text-ink-muted text-[11px] uppercase tracking-wider">
            <div class="col-span-5">ORDER ID / POST</div>
            <div class="col-span-3">NOMINAL</div>
            <div class="col-span-2">STATUS</div>
            <div class="col-span-2 text-right">WAKTU</div>
          </div>

          <div class="divide-y divide-border">
            <div
              v-for="txn in transactions"
              :key="txn.id"
              class="grid grid-cols-12 gap-2 p-3 items-center hover:bg-canvas/40 transition-colors"
            >
              <div class="col-span-5">
                <div class="font-mono font-bold text-ink text-[11px]">{{ txn.midtrans_order_id }}</div>
                <div class="text-[10px] text-ink-muted">Tautan Post: {{ txn.post_id?.slice(0, 8) }}...</div>
              </div>

              <div class="col-span-3 font-bold text-ink">
                Rp{{ Number(txn.gross_amount).toLocaleString('id-ID') }}
              </div>

              <div class="col-span-2">
                <span
                  class="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase"
                  :class="[
                    txn.status_pembayaran === 'settlement'
                      ? 'bg-emerald-100 text-emerald-800'
                      : txn.status_pembayaran === 'pending'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ txn.status_pembayaran === 'settlement' ? '✓ Lunas' : txn.status_pembayaran }}
                </span>
              </div>

              <div class="col-span-2 text-right text-[11px] text-ink-muted font-mono">
                {{ formatTime(txn.created_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
