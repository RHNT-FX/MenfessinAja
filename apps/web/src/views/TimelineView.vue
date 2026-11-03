<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import { useAuthStore } from '@/stores/auth';
import { apiFetch } from '@/utils/api';
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
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
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
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
    } else {
      composeResult.value = {
        success: true,
        flagged: false,
        message: 'Menfess berhasil dikirim dan ditayangkan!'
      };
      if (res.data) {
        posts.value.unshift({
          ...res.data,
          comments_count: 0
        });
      }
    }

    setTimeout(() => {
      isCreateOpen.value = false;
      teksKonten.value = '';
      composeResult.value = null;
    }, 1800);
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

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
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
            </div>

            <!-- Tambahkan Foto Button -->
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-2 bg-surface border border-border text-xs font-semibold text-ink hover:bg-surface-muted rounded-sm transition-colors"
            >
              <ImageIcon class="w-3.5 h-3.5" />
              <span>Tambahkan foto</span>
            </button>
            <p class="text-[10px] text-ink-muted">
              Opsional. Foto dikompresi otomatis ke WebP ≤100 KB per berkas.
            </p>

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

            <!-- Turnstile Indicator -->
            <div class="p-3 bg-surface border border-border rounded-sm flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <ShieldCheck class="w-4 h-4 text-primary" />
                <div>
                  <div class="font-semibold text-ink">Verifikasi manusia</div>
                  <div class="text-[10px] text-ink-muted">Cloudflare Turnstile · Terproteksi</div>
                </div>
              </div>
              <span class="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 class="w-3.5 h-3.5" /> Terverifikasi
              </span>
            </div>

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

          <!-- Right Column: QRIS Mockup Panel (Sesuai Figma 05) -->
          <div class="lg:col-span-5 bg-surface border border-border p-5 rounded-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="px-2 py-0.5 bg-badge-superchatBg text-badge-superchatText text-[10px] font-bold uppercase rounded-xs">
                  DEMO / BUKAN PEMBAYARAN
                </span>
              </div>

              <h3 class="font-serif text-xl text-ink font-normal mb-1">
                Sematkan ceritamu.
              </h3>
              <p class="text-[11px] text-ink-muted leading-relaxed mb-4">
                Superchat / Pinned Post. Tampil di atas feed selama 24 jam. Konten tetap harus lolos moderasi.
              </p>

              <div class="flex items-baseline justify-between border-t border-border pt-3 mb-4">
                <span class="text-xs text-ink-muted">Total (contoh)</span>
                <span class="text-xl font-bold text-ink">Rp5.000</span>
              </div>

              <!-- QRIS Placeholder Box -->
              <div class="bg-canvas border border-dashed border-border p-6 rounded-sm text-center">
                <div class="text-[11px] font-semibold text-ink-muted mb-2">QRIS · via Midtrans</div>
                <div class="w-32 h-32 mx-auto bg-surface border border-border flex flex-col items-center justify-center p-2 rounded-xs">
                  <QrCode class="w-16 h-16 text-ink/70" />
                  <span class="text-[10px] font-bold text-ink tracking-widest mt-1">DEMO QRIS</span>
                </div>
                <div class="text-[10px] text-ink-muted mt-3">
                  Representasi QRIS, bukan kode bayar sungguhan.
                </div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
              <span class="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold text-[10px] rounded-xs">
                Pending
              </span>
              <span class="text-[11px] text-ink-muted font-mono">Sisa 09:42</span>
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
