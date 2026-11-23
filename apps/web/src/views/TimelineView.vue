<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import TurnstileWidget from '@/components/common/TurnstileWidget.vue';
import { useAuthStore } from '@/stores/auth';
import { apiFetch } from '@/utils/api';
import { compressImageToWebp } from '@/utils/imageCompressor';
import type { Comment } from '@menfessin-aja/shared';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  QrCode,
  Send,
  Sparkles,
  Wand2,
  X,
  Zap
} from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

interface FeedPost {
  id: string;
  user_id: string;
  kategori: string;
  teks_konten: string;
  media_url?: string | null;
  ai_score: number;
  status: string;
  is_boosted: boolean;
  upvotes_count: number;
  comments_count: number;
  user_vote?: 'up' | 'down' | null;
  extra_meta?: {
    category_pill?: string;
    is_superchat?: boolean;
    [key: string]: unknown;
  };
  created_at: string;
}

const router = useRouter();
const authStore = useAuthStore();

// Feed state
const posts = ref<FeedPost[]>([]);
const isLoading = ref(false);
const errorMsg = ref('');
const activeTab = ref<'terbaru' | 'populer'>('terbaru');
const selectedTopic = ref('Semua cerita');

// Compose modal state
const isCreateOpen = ref(false);
const kategori = ref('Curhat');
const teksKonten = ref('');
const isSuperchatSelected = ref(false);
const isSubmitting = ref(false);
const composeResult = ref<{ success: boolean; flagged?: boolean; message: string } | null>(null);
const turnstileToken = ref('demo-turnstile-token');

// Live AI & Privacy Moderation Inspector
interface AiPreviewData {
  originalText?: string;
  sanitizedText: string;
  nimMaskedCount: number;
  phoneMaskedCount: number;
  aiScore: number;
  isSafe: boolean;
  status: 'approved' | 'flagged';
  flags: string[];
  reason?: string;
}

const aiPreview = ref<AiPreviewData | null>(null);
const isCheckingAi = ref(false);
let debounceTimer: any = null;

watch(teksKonten, (newVal) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!newVal || newVal.trim().length < 4) {
    aiPreview.value = null;
    return;
  }
  debounceTimer = setTimeout(() => {
    checkAiModeration();
  }, 350);
});

async function checkAiModeration() {
  if (!teksKonten.value.trim()) return;
  isCheckingAi.value = true;
  try {
    const res = await apiFetch('/api/posts/preview-moderation', {
      method: 'POST',
      body: JSON.stringify({ teks_konten: teksKonten.value })
    });
    if (res.success && res.data) {
      const d = res.data;
      const score = typeof d.aiScore === 'number' ? d.aiScore : (typeof d.ai_score === 'number' ? d.ai_score : 0.05);
      aiPreview.value = {
        originalText: d.originalText || teksKonten.value,
        sanitizedText: d.sanitizedText || d.sanitized_content || teksKonten.value,
        nimMaskedCount: d.nimMaskedCount || 0,
        phoneMaskedCount: d.phoneMaskedCount || 0,
        aiScore: score,
        isSafe: typeof d.isSafe === 'boolean' ? d.isSafe : (score < 0.70),
        status: d.status || (score >= 0.70 ? 'flagged' : 'approved'),
        flags: d.flags || [],
        reason: d.reason || ''
      };
    }
  } catch (err) {
    console.error('Gagal evaluasi AI:', err);
  } finally {
    isCheckingAi.value = false;
  }
}

function applyPreset(type: 'safe' | 'doxxing' | 'toxic') {
  if (type === 'safe') {
    teksKonten.value = 'Semangat teman-teman yang besok ada presentasi tugas akhir di lab! Semoga semua kelompok dapat nilai A.';
    kategori.value = 'Akademik';
  } else if (type === 'doxxing') {
    teksKonten.value = 'Ada dompet tertinggal di kantin barat. Pemiliknya tolong hubungi nomor 081234567890 atau langsung cari mahasiswa NIM 11241059 di perpustakaan.';
    kategori.value = 'Info kampus';
  } else if (type === 'toxic') {
    teksKonten.value = 'Dasar bajingan tolol, awas aja kalo ketemu di parkiran bakal kuhajar kamu!';
    kategori.value = 'Curhat';
  }
}

// Midtrans Snap QRIS Checkout & Payment State (Sprint 4)
interface CheckoutState {
  orderId: string;
  token: string;
  redirectUrl: string;
  grossAmount: number;
  status: 'pending' | 'settlement' | 'expire';
  postId: string;
}

const activeCheckout = ref<CheckoutState | null>(null);
const isPaying = ref(false);

async function handleSimulatePayment() {
  if (!activeCheckout.value) return;
  isPaying.value = true;
  try {
    const res = await apiFetch(`/api/transactions/${activeCheckout.value.orderId}/simulate`, {
      method: 'POST'
    });
    if (res.success) {
      activeCheckout.value.status = 'settlement';
      // Tandai postingan sebagai boosted di linimasa
      const targetPost = posts.value.find((p) => p.id === activeCheckout.value?.postId);
      if (targetPost) {
        targetPost.is_boosted = true;
      }
      setTimeout(() => {
        isCreateOpen.value = false;
        activeCheckout.value = null;
        teksKonten.value = '';
        removeImage();
      }, 1500);
    }
  } catch (err: any) {
    alert(err.message || 'Gagal simulasi pembayaran');
  } finally {
    isPaying.value = false;
  }
}

// WebP image compression state (SRS 1.3.3 & NFR-001)
const imagePreview = ref('');
const imageCompressionInfo = ref<{ originalKb: number; compressedKb: number; reduction: number } | null>(null);
const isCompressing = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

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
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

// Comments modal / drawer state
const isCommentsOpen = ref(false);
const activeCommentPost = ref<FeedPost | null>(null);
const postComments = ref<Comment[]>([]);
const isLoadingComments = ref(false);
const newCommentText = ref('');
const isSubmittingComment = ref(false);

onMounted(() => {
  loadPosts();
});

async function loadPosts() {
  isLoading.value = true;
  errorMsg.value = '';
  try {
    const res = await apiFetch('/api/posts', {
      params: { kategori: 'menfess' }
    });
    if (res.success && res.data?.items) {
      posts.value = res.data.items;
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal memuat postingan linimasa';
  } finally {
    isLoading.value = false;
  }
}

// Filtered and sorted posts
const displayedPosts = computed(() => {
  let list = [...posts.value];

  // Topic filter
  if (selectedTopic.value && selectedTopic.value !== 'Semua cerita') {
    list = list.filter((p) => {
      const pill = p.extra_meta?.category_pill?.toLowerCase() || '';
      return pill.includes(selectedTopic.value.toLowerCase());
    });
  }

  // Tab sort
  if (activeTab.value === 'populer') {
    list.sort((a, b) => {
      if (a.is_boosted && !b.is_boosted) return -1;
      if (!a.is_boosted && b.is_boosted) return 1;
      return (b.upvotes_count || 0) - (a.upvotes_count || 0);
    });
  } else {
    list.sort((a, b) => {
      if (a.is_boosted && !b.is_boosted) return -1;
      if (!a.is_boosted && b.is_boosted) return 1;
      const timeB = b?.created_at ? new Date(b.created_at).getTime() : 0;
      const timeA = a?.created_at ? new Date(a.created_at).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }

  return list;
});

function handleFilterTopic(topic: string) {
  selectedTopic.value = topic;
}

function handleOpenCreate() {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  isCreateOpen.value = true;
  composeResult.value = null;
  aiPreview.value = null;
  activeCheckout.value = null;
  removeImage();
}

async function handleVote(post: FeedPost, direction: 'up' | 'down') {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  try {
    const res = await apiFetch(`/api/posts/${post.id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type: direction })
    });
    if (res.success && res.data) {
      post.upvotes_count = res.data.upvotes_count;
      post.user_vote = res.data.user_vote;
    }
  } catch (err: any) {
    console.error('Vote gagal:', err);
  }
}

async function handleSubmitPost() {
  if (!teksKonten.value.trim() || isSubmitting.value) return;

  isSubmitting.value = true;
  composeResult.value = null;

  try {
    const res = await apiFetch('/api/posts/menfess', {
      method: 'POST',
      body: JSON.stringify({
        teks_konten: teksKonten.value,
        media_url: imagePreview.value || undefined,
        category_pill: kategori.value,
        is_superchat: isSuperchatSelected.value
      })
    });

    if (res.flagged) {
      composeResult.value = {
        success: true,
        flagged: true,
        message: 'Konten Anda memerlukan peninjauan oleh tim moderasi dan telah masuk antrean admin.'
      };
      setTimeout(() => {
        isCreateOpen.value = false;
        teksKonten.value = '';
        removeImage();
        composeResult.value = null;
      }, 2000);
    } else {
      if (res.data) {
        const postObj = (res.data as any).post || res.data;
        if (postObj && postObj.id) {
          posts.value.unshift({
            ...postObj,
            comments_count: postObj.comments_count || 0
          });
        }
      }

      // Jika memilih Superchat/Pinned Post, lakukan checkout Snap QRIS
      if (isSuperchatSelected.value && res.data?.id) {
        try {
          const checkoutRes = await apiFetch('/api/transactions/checkout', {
            method: 'POST',
            body: JSON.stringify({
              post_id: res.data.id,
              feature_type: 'superchat',
              gross_amount: 5000
            })
          });

          if (checkoutRes.success && checkoutRes.data) {
            activeCheckout.value = {
              orderId: checkoutRes.data.orderId,
              token: checkoutRes.data.token,
              redirectUrl: checkoutRes.data.redirectUrl,
              grossAmount: checkoutRes.data.grossAmount,
              status: 'pending',
              postId: res.data.id
            };

            composeResult.value = {
              success: true,
              flagged: false,
              message: 'Menfess terbit! Selesaikan pembayaran QRIS di samping untuk menyematkan ke urutan teratas.'
            };

            if (typeof window !== 'undefined' && (window as any).snap && !checkoutRes.data.isMock) {
              (window as any).snap.pay(checkoutRes.data.token, {
                onSuccess: () => {
                  if (activeCheckout.value) activeCheckout.value.status = 'settlement';
                  const p = posts.value.find((item) => item.id === res.data.id);
                  if (p) p.is_boosted = true;
                }
              });
            }
            return;
          }
        } catch (checkoutErr: any) {
          console.warn('Gagal checkout superchat:', checkoutErr);
        }
      }

      composeResult.value = {
        success: true,
        flagged: false,
        message: 'Menfess berhasil dikirim dan ditayangkan!'
      };

      setTimeout(() => {
        isCreateOpen.value = false;
        teksKonten.value = '';
        removeImage();
        composeResult.value = null;
      }, 1800);
    }
  } catch (err: any) {
    composeResult.value = {
      success: false,
      message: err.message || 'Gagal mengirim menfess'
    };
  } finally {
    isSubmitting.value = false;
  }
}

// Comments handler
async function openComments(post: FeedPost) {
  activeCommentPost.value = post;
  isCommentsOpen.value = true;
  postComments.value = [];
  newCommentText.value = '';
  isLoadingComments.value = true;

  try {
    const res = await apiFetch(`/api/posts/${post.id}/comments`);
    if (res.success && res.data) {
      postComments.value = res.data;
    }
  } catch (err) {
    console.error('Gagal memuat komentar:', err);
  } finally {
    isLoadingComments.value = false;
  }
}

async function submitComment() {
  if (!newCommentText.value.trim() || !activeCommentPost.value || isSubmittingComment.value) return;

  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  isSubmittingComment.value = true;
  try {
    const res = await apiFetch(`/api/posts/${activeCommentPost.value.id}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        isi_komentar: newCommentText.value
      })
    });

    if (res.success && res.data) {
      postComments.value.push(res.data);
      activeCommentPost.value.comments_count = (activeCommentPost.value.comments_count || 0) + 1;
      newCommentText.value = '';
    }
  } catch (err: any) {
    alert(err.message || 'Gagal mengirim komentar');
  } finally {
    isSubmittingComment.value = false;
  }
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Baru saja';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diff)) return 'Baru saja';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}
</script>

<template>
  <div class="flex items-start gap-8">
    <!-- Left Sidebar (Sesuai Figma) -->
    <AppSidebar
      @open-create="handleOpenCreate"
      @filter-topic="handleFilterTopic"
    />

    <!-- Main Feed Area (Sesuai Figma 01_Menfess_feed_Desktop.png) -->
    <div class="flex-1 min-w-0 max-w-3xl">
      <!-- Header Section -->
      <div class="mb-6">
        <div class="text-[11px] font-semibold text-ink-muted tracking-wider uppercase mb-1">
          MENFESS / LINIMASA KAMPUS
        </div>
        <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight">
          Yang lagi lewat.
        </h1>
        <p class="text-xs sm:text-sm text-ink-muted mt-1.5">
          Cerita kecil, pertanyaan besar, dan hal-hal di sela kelas.
        </p>
      </div>

      <!-- Quick Compose Box (Sesuai Figma) -->
      <div class="bg-surface border border-border p-4 mb-6 rounded-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <span class="text-xs text-ink-muted">Ada yang mau diceritain hari ini?</span>
        <button
          @click="handleOpenCreate"
          class="bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-xs font-semibold px-4 py-2 rounded-sm transition-all flex items-center justify-center gap-1.5"
        >
          <span>Tulis Menfess</span>
          <ArrowUpRight class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Feed Sorting Tabs (Sesuai Figma) -->
      <div class="flex items-center gap-6 border-b border-border pb-2.5 mb-6 text-xs font-semibold">
        <button
          @click="activeTab = 'terbaru'"
          class="pb-1 transition-colors relative"
          :class="activeTab === 'terbaru' ? 'text-ink border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          Terbaru
        </button>
        <button
          @click="activeTab = 'populer'"
          class="pb-1 transition-colors relative"
          :class="activeTab === 'populer' ? 'text-ink border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          Populer
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="p-12 text-center text-ink-muted text-xs flex flex-col items-center gap-2">
        <Loader2 class="w-5 h-5 animate-spin text-primary" />
        <span>Memuat cerita terbaru...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMsg" class="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm mb-4">
        {{ errorMsg }}
      </div>

      <!-- Empty State -->
      <div v-else-if="displayedPosts.length === 0" class="p-12 text-center bg-surface border border-dashed border-border rounded-sm text-xs text-ink-muted">
        Belum ada cerita di topik ini. Jadilah yang pertama menulis menfess!
      </div>

      <!-- Feed Items List -->
      <div v-else class="space-y-4">
        <article
          v-for="post in displayedPosts"
          :key="post.id"
          class="p-5 sm:p-6 transition-all rounded-sm border"
          :class="[
            post.is_boosted
              ? 'bg-primary-soft border-primary/20 border-t-2 border-t-primary'
              : 'bg-surface border-border hover:border-ink/30'
          ]"
        >
          <!-- Superchat Banner (Sesuai Figma) -->
          <div v-if="post.is_boosted" class="flex items-center justify-between pb-3 mb-2 border-b border-primary/10">
            <span class="text-[11px] font-bold tracking-wider text-primary flex items-center gap-1.5 uppercase">
              <Sparkles class="w-3.5 h-3.5" />
              SUPERCHAT / PINNED POST BERBAYAR
            </span>
          </div>

          <!-- Metadata Post (Tag & Time) -->
          <div class="flex items-center justify-between text-xs mb-2">
            <span class="font-bold text-primary">#{{ (post.extra_meta?.category_pill || 'curhat').toLowerCase().replace(/\s+/g, '') }}</span>
            <span class="text-ink-muted">Anonim · {{ formatRelativeTime(post.created_at) }}</span>
          </div>

          <!-- Post Content (Serif Typography Lora Sesuai Figma) -->
          <p class="font-serif text-base sm:text-[17px] text-ink leading-relaxed my-3 whitespace-pre-line">
            {{ post.teks_konten }}
          </p>

          <!-- Post Media / Image (WebP) -->
          <div v-if="post.media_url" class="my-3 rounded-sm overflow-hidden border border-border max-h-96">
            <img :src="post.media_url" alt="Media menfess" class="w-full h-auto max-h-96 object-cover" />
          </div>

          <!-- Interaction Bar (Sesuai Figma) -->
          <div class="flex items-center justify-between pt-3 mt-2 border-t border-border/40 text-xs">
            <div class="flex items-center gap-3">
              <!-- Combined Up/Downvote Pill -->
              <div class="inline-flex items-center bg-surface border border-border rounded-sm overflow-hidden text-xs">
                <button
                  @click="handleVote(post, 'up')"
                  class="px-2.5 py-1 hover:bg-canvas transition-colors flex items-center gap-1 font-semibold"
                  :class="post.user_vote === 'up' ? 'text-primary bg-primary-soft' : 'text-ink'"
                  title="Upvote"
                >
                  <span class="font-bold">↑</span>
                  <span>{{ post.upvotes_count }}</span>
                </button>
                <span class="h-3 w-px bg-border"></span>
                <button
                  @click="handleVote(post, 'down')"
                  class="px-2 py-1 hover:bg-canvas transition-colors"
                  :class="post.user_vote === 'down' ? 'text-red-600 bg-red-50' : 'text-ink-muted hover:text-ink'"
                  title="Downvote"
                >
                  ↓
                </button>
              </div>

              <!-- Comment Button -->
              <button
                @click="openComments(post)"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 text-ink-muted hover:text-ink transition-colors font-medium cursor-pointer"
              >
                <MessageSquare class="w-3.5 h-3.5" />
                <span>{{ post.comments_count }}</span>
              </button>
            </div>

            <!-- Report Link -->
            <button class="text-[11px] text-ink-muted hover:text-ink transition-colors">
              Laporkan
            </button>
          </div>
        </article>
      </div>

      <!-- Load More Button (Sesuai Figma) -->
      <div v-if="displayedPosts.length > 0" class="mt-8 text-center">
        <button
          @click="loadPosts"
          class="px-6 py-2.5 bg-surface border border-border text-xs font-semibold text-ink hover:bg-surface-muted transition-colors rounded-sm shadow-xs inline-flex items-center gap-1.5"
        >
          <span>Segarkan cerita</span>
          <span>↻</span>
        </button>
      </div>
    </div>

    <!-- COMPOSE MODAL (Sesuai Figma 05_New_Menfess_Superchat_Desktop.png) -->
    <div
      v-if="isCreateOpen"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-canvas border border-border w-full max-w-4xl p-6 sm:p-8 rounded-sm shadow-2xl relative my-8">
        <!-- Close Button -->
        <button
          @click="isCreateOpen = false"
          class="absolute top-5 right-5 text-ink-muted hover:text-ink p-1 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left Column: Form Tulis Menfess -->
          <div class="lg:col-span-7 space-y-4">
            <div>
              <div class="text-[11px] font-bold text-ink-muted tracking-wider uppercase">
                CERITA BARU / ANGGOTA
              </div>
              <h2 class="font-serif text-2xl sm:text-3xl text-ink font-normal mt-1">
                Menfessin aja.
              </h2>
            </div>

            <!-- Info Box Doxxing (Sesuai Figma) -->
            <div class="border-l-4 border-primary bg-primary-soft p-3.5 text-xs text-ink leading-relaxed">
              <span class="font-bold text-primary block mb-0.5">Identitasmu tidak ikut tampil.</span>
              Jangan cantumkan nama asli, nomor HP, atau NIM siapa pun. Sistem otomatis menyamarkan data pribadi dan memoderasi ujaran kebencian.
            </div>

            <!-- Kategori Selector -->
            <div>
              <label class="block text-xs font-semibold text-ink mb-1">Kategori *</label>
              <select
                v-model="kategori"
                class="w-full p-2.5 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink font-medium"
              >
                <option>Curhat</option>
                <option>Info kampus</option>
                <option>Akademik</option>
                <option>Tanya</option>
                <option>Apresiasi</option>
              </select>
            </div>

            <!-- Cerita Input -->
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <label class="font-semibold text-ink">Ceritamu *</label>
                <span class="text-ink-muted text-[11px]">{{ teksKonten.length }} / 1.000 karakter</span>
              </div>
              <textarea
                v-model="teksKonten"
                rows="5"
                placeholder="Tulis ceritamu di sini..."
                class="w-full p-3 bg-surface border border-border text-xs font-serif rounded-sm focus:outline-none focus:border-ink leading-relaxed"
              ></textarea>
              <p class="text-[10px] text-ink-muted mt-1">
                Wajib diisi. Format NIM dan nomor telepon seluler akan otomatis disamarkan demi privasi.
              </p>

              <!-- Quick Demo Preset Buttons for Live Presentation -->
              <div class="flex flex-wrap items-center gap-1.5 mt-2">
                <span class="text-[10px] text-ink-muted font-semibold">Uji Demo Cepat:</span>
                <button
                  type="button"
                  @click="applyPreset('safe')"
                  class="px-2 py-0.5 bg-surface border border-border hover:border-emerald-600 text-[10px] rounded-xs text-ink transition-colors flex items-center gap-1 cursor-pointer"
                  title="Isi contoh menfess wajar yang lolos otomatis"
                >
                  <span class="text-emerald-700 font-bold">✓</span>
                  <span>Cerita Wajar</span>
                </button>
                <button
                  type="button"
                  @click="applyPreset('doxxing')"
                  class="px-2 py-0.5 bg-surface border border-border hover:border-primary text-[10px] rounded-xs text-ink transition-colors flex items-center gap-1 cursor-pointer"
                  title="Isi contoh teks yang memuat NIM dan Nomor HP"
                >
                  <span class="text-primary font-bold">🔒</span>
                  <span>Doxxing NIM & HP</span>
                </button>
                <button
                  type="button"
                  @click="applyPreset('toxic')"
                  class="px-2 py-0.5 bg-surface border border-border hover:border-red-600 text-[10px] rounded-xs text-ink transition-colors flex items-center gap-1 cursor-pointer"
                  title="Isi contoh ujaran kebencian / makian kasar"
                >
                  <span class="text-red-700 font-bold">⚠️</span>
                  <span>Ujaran Kasar (Flagged)</span>
                </button>
              </div>

              <!-- Live AI NLP & Privacy Moderation Inspector -->
              <div
                v-if="aiPreview || isCheckingAi"
                class="mt-2.5 p-3 rounded-sm border transition-all text-xs"
                :class="aiPreview?.isSafe ? 'bg-emerald-50/50 border-emerald-300' : 'bg-amber-50/70 border-amber-300'"
              >
                <div class="flex items-center justify-between font-semibold mb-1.5">
                  <div class="flex items-center gap-1.5">
                    <Wand2 class="w-3.5 h-3.5" :class="aiPreview?.isSafe ? 'text-emerald-700' : 'text-amber-700'" />
                    <span class="text-[11px] font-bold text-ink">Inspeksi AI NLP & Privasi</span>
                    <Loader2 v-if="isCheckingAi" class="w-3 h-3 animate-spin text-primary ml-1" />
                  </div>
                  <span
                    v-if="aiPreview"
                    class="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider"
                    :class="aiPreview.isSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'"
                  >
                    {{ aiPreview.isSafe ? 'Lolos Otomatis' : 'Tertahan (Flagged)' }}
                  </span>
                </div>

                <div v-if="aiPreview" class="space-y-1.5 text-[11px]">
                  <div class="flex items-center justify-between text-ink">
                    <span>Skor Probabilitas AI:</span>
                    <span class="font-mono font-bold" :class="(aiPreview.aiScore ?? 0) >= 0.70 ? 'text-red-700' : 'text-emerald-700'">
                      {{ (aiPreview.aiScore ?? 0).toFixed(2) }} / 1.00 {{ (aiPreview.aiScore ?? 0) >= 0.70 ? '(≥ 0.70 Ambang Flagged)' : '(< 0.70 Aman)' }}
                    </span>
                  </div>

                  <!-- Progress Bar Skala Skor AI -->
                  <div class="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      class="h-full transition-all duration-300 rounded-full"
                      :class="(aiPreview.aiScore ?? 0) >= 0.70 ? 'bg-red-600' : 'bg-emerald-600'"
                      :style="{ width: `${Math.min(100, Math.max(5, (aiPreview.aiScore ?? 0) * 100))}%` }"
                    ></div>
                  </div>

                  <!-- Sanitasi Preview Info -->
                  <div v-if="aiPreview.nimMaskedCount > 0 || aiPreview.phoneMaskedCount > 0" class="pt-1 text-emerald-800 font-medium flex items-center gap-1">
                    <CheckCircle2 class="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                    <span>Data pribadi tersanitasi: {{ aiPreview.nimMaskedCount }} NIM & {{ aiPreview.phoneMaskedCount }} No. HP disamarkan.</span>
                  </div>

                  <!-- Reason / Flag Info -->
                  <div v-if="aiPreview.reason" class="text-amber-900 font-medium">
                    {{ aiPreview.reason }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Tambahkan Foto Section (SRS 1.3.3 & NFR-001: WebP ≤100 KB) -->
            <div>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />

              <!-- Preview Image jika sudah dipilih -->
              <div v-if="imagePreview" class="relative w-full h-40 bg-canvas border border-border rounded-sm overflow-hidden mb-2">
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

              <!-- Button Tambah Foto -->
              <div v-else class="flex items-center gap-3">
                <button
                  type="button"
                  @click="triggerFileInput"
                  :disabled="isCompressing"
                  class="inline-flex items-center gap-1.5 px-3 py-2 bg-surface border border-border text-xs font-semibold text-ink hover:bg-surface-muted rounded-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Loader2 v-if="isCompressing" class="w-3.5 h-3.5 animate-spin text-primary" />
                  <ImageIcon v-else class="w-3.5 h-3.5" />
                  <span>{{ isCompressing ? 'Mengompresi ke WebP...' : 'Tambahkan foto' }}</span>
                </button>
                <span class="text-[10px] text-ink-muted">
                  Opsional · Otomatis dikonversi ke WebP ≤100 KB
                </span>
              </div>
            </div>

            <!-- Toggle Superchat Option -->
            <div
              @click="isSuperchatSelected = !isSuperchatSelected"
              class="p-3.5 bg-primary-soft border border-primary/20 rounded-sm cursor-pointer hover:border-primary transition-all flex items-start gap-3"
            >
              <Sparkles class="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div class="text-xs">
                <div class="font-bold text-primary flex items-center gap-2">
                  <span>Pakai Superchat / Pinned Post</span>
                  <span v-if="isSuperchatSelected" class="text-[10px] bg-primary text-white px-1.5 py-0.2 rounded-xs">Aktif</span>
                </div>
                <div class="text-ink-muted text-[11px] mt-0.5 leading-normal">
                  Contoh Rp5.000 / 24 jam. Disematkan di urutan teratas feed linimasa.
                </div>
              </div>
            </div>

            <!-- Cloudflare Turnstile Verification Widget -->
            <TurnstileWidget v-model="turnstileToken" />

            <!-- Status Alert Box -->
            <div
              v-if="composeResult"
              class="p-3 rounded-sm text-xs font-semibold flex items-center gap-2"
              :class="[
                composeResult.flagged
                  ? 'bg-amber-50 border border-amber-200 text-amber-900'
                  : composeResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              ]"
            >
              <AlertTriangle v-if="composeResult.flagged" class="w-4 h-4 text-amber-700 shrink-0" />
              <CheckCircle2 v-else-if="composeResult.success" class="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{{ composeResult.message }}</span>
            </div>

            <!-- Buttons -->
            <div class="flex items-center gap-3 pt-2">
              <button
                @click="handleSubmitPost"
                :disabled="!teksKonten.trim() || isSubmitting"
                class="bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-xs font-semibold px-5 py-2.5 rounded-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ isSubmitting ? 'Mengevaluasi AI...' : 'Kirim Menfess' }}</span>
              </button>
              <button
                @click="isCreateOpen = false"
                class="bg-surface border border-border text-ink hover:bg-surface-muted text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors"
              >
                Batal
              </button>
            </div>
          </div>

          <!-- Right Column: QRIS Panel (Sesuai Figma 05 & Midtrans Snap) -->
          <div class="lg:col-span-5 bg-surface border border-border p-5 rounded-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span
                  class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs"
                  :class="[
                    activeCheckout?.status === 'settlement'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeCheckout
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-badge-superchatBg text-badge-superchatText'
                  ]"
                >
                  {{
                    activeCheckout?.status === 'settlement'
                      ? 'Lunas (Settlement)'
                      : activeCheckout
                      ? 'Menunggu Pembayaran'
                      : 'Midtrans QRIS Snap'
                  }}
                </span>
                <span v-if="activeCheckout" class="font-mono text-[9px] text-ink-muted truncate max-w-[140px]">
                  {{ activeCheckout.orderId }}
                </span>
              </div>

              <h3 class="font-serif text-xl text-ink font-normal mb-1">
                Sematkan ceritamu.
              </h3>
              <p class="text-[11px] text-ink-muted leading-relaxed mb-4">
                Superchat / Pinned Post. Tampil di urutan teratas linimasa selama 24 jam.
              </p>

              <div class="flex items-baseline justify-between border-t border-border pt-3 mb-4">
                <span class="text-xs text-ink-muted">Total Pembayaran</span>
                <span class="text-xl font-bold text-ink">
                  Rp{{ (activeCheckout?.grossAmount || 5000).toLocaleString('id-ID') }}
                </span>
              </div>

              <!-- QRIS Display Box -->
              <div class="bg-canvas border border-dashed border-border p-5 rounded-sm text-center">
                <div class="text-[11px] font-semibold text-ink-muted mb-2">
                  QRIS Dinamis · Midtrans Snap
                </div>
                <div class="w-36 h-36 mx-auto bg-surface border border-border flex flex-col items-center justify-center p-2 rounded-xs shadow-xs relative">
                  <QrCode class="w-24 h-24 text-ink" />
                  <span class="text-[9px] font-bold text-ink tracking-widest mt-1">QRIS STANDAR</span>
                  <div
                    v-if="activeCheckout?.status === 'settlement'"
                    class="absolute inset-0 bg-emerald-700/90 text-white flex flex-col items-center justify-center p-2 rounded-xs"
                  >
                    <CheckCircle2 class="w-8 h-8 mb-1" />
                    <span class="text-[10px] font-bold">LUNAS</span>
                  </div>
                </div>
                <div class="text-[10px] text-ink-muted mt-2.5">
                  {{
                    activeCheckout?.status === 'settlement'
                      ? 'Pembayaran berhasil diverifikasi via Webhook Midtrans.'
                      : 'Pindai dengan GoPay, OVO, Dana, BCA, atau Livin Mandiri.'
                  }}
                </div>
              </div>

              <!-- Tombol Simulasi Bayar Offline / Live Presentation -->
              <div v-if="activeCheckout && activeCheckout.status === 'pending'" class="mt-3">
                <button
                  type="button"
                  @click="handleSimulatePayment"
                  :disabled="isPaying"
                  class="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-xs rounded-sm transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  title="Simulasikan pembayaran QRIS sukses untuk demo presentasi"
                >
                  <Loader2 v-if="isPaying" class="w-3.5 h-3.5 animate-spin" />
                  <Zap v-else class="w-3.5 h-3.5" />
                  <span>{{ isPaying ? 'Memproses Webhook...' : '⚡ Simulasikan Bayar QRIS Sukses' }}</span>
                </button>
              </div>

              <div
                v-else-if="activeCheckout?.status === 'settlement'"
                class="mt-3 p-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-semibold rounded-xs flex items-center gap-1.5"
              >
                <CheckCircle2 class="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Superchat aktif! Postingan disematkan di posisi teratas.</span>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span
                class="px-2 py-0.5 font-semibold text-[10px] rounded-xs"
                :class="activeCheckout?.status === 'settlement' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'"
              >
                {{ activeCheckout?.status === 'settlement' ? 'Settlement' : 'Pending' }}
              </span>
              <span class="text-[11px] text-ink-muted font-mono">24 Jam Pinned</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- COMMENTS DRAWER / MODAL -->
    <div
      v-if="isCommentsOpen && activeCommentPost"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-canvas border border-border w-full max-w-lg p-6 rounded-sm shadow-2xl relative my-8 flex flex-col max-h-[85vh]">
        <!-- Close Button -->
        <button
          @click="isCommentsOpen = false"
          class="absolute top-4 right-4 text-ink-muted hover:text-ink p-1 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="mb-4 pr-6">
          <div class="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
            DISKUSI & KOMENTAR
          </div>
          <p class="font-serif text-sm text-ink line-clamp-2">
            “{{ activeCommentPost.teks_konten }}”
          </p>
        </div>

        <!-- Comments List Area -->
        <div class="flex-1 overflow-y-auto border-t border-b border-border py-4 space-y-3 min-h-[160px]">
          <div v-if="isLoadingComments" class="text-center py-6 text-xs text-ink-muted flex flex-col items-center gap-1.5">
            <Loader2 class="w-4 h-4 animate-spin text-primary" />
            <span>Memuat komentar...</span>
          </div>

          <div v-else-if="postComments.length === 0" class="text-center py-6 text-xs text-ink-muted">
            Belum ada komentar. Berikan tanggapan pertamamu!
          </div>

          <div
            v-else
            v-for="comment in postComments"
            :key="comment.id"
            class="p-3 bg-surface border border-border rounded-sm text-xs"
          >
            <div class="flex items-center justify-between text-[10px] text-ink-muted mb-1">
              <span class="font-semibold text-ink">Anonim</span>
              <span>{{ formatRelativeTime(comment.created_at) }}</span>
            </div>
            <p class="text-ink leading-relaxed">
              {{ comment.isi_komentar }}
            </p>
          </div>
        </div>

        <!-- Add Comment Input -->
        <div class="pt-4 flex items-center gap-2">
          <input
            v-model="newCommentText"
            @keyup.enter="submitComment"
            type="text"
            placeholder="Tulis balasan anonim..."
            class="flex-1 p-2 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink"
            :disabled="isSubmittingComment"
          />
          <button
            @click="submitComment"
            :disabled="!newCommentText.trim() || isSubmittingComment"
            class="bg-primary hover:bg-primary-hover active:scale-[0.99] text-white p-2 rounded-sm transition-all disabled:opacity-50"
            title="Kirim"
          >
            <Loader2 v-if="isSubmittingComment" class="w-4 h-4 animate-spin" />
            <Send v-else class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
