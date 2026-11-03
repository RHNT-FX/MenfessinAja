<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import {
  ArrowUpRight,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  QrCode,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-vue-next';
import { ref } from 'vue';

// Modal state
const isCreateOpen = ref(false);
const activeTab = ref<'terbaru' | 'populer'>('terbaru');
const selectedTopic = ref('Semua cerita');

// Compose form state
const kategori = ref('Info kampus');
const teksKonten = ref('');
const isSuperchatSelected = ref(true);
const composeSubmitted = ref(false);

const demoPosts = ref([
  {
    id: 'post-superchat-1',
    is_boosted: true,
    tag: '#info kampus',
    time: '1 jam lalu',
    author: 'Anonim',
    text: 'Punya buku yang udah selesai dibaca? Minggu ini kita tukeran buku di taman kampus. Bawa satu, pulang bawa cerita baru. Jumat, jam 15.30!',
    upvotes: 94,
    comments_count: 16,
    hasVoted: false
  },
  {
    id: 'post-1',
    is_boosted: false,
    tag: '#curhat',
    time: '8 menit lalu',
    author: 'Anonim',
    text: 'Ada yang ngerasa semester ini capeknya beda? Bukan tugasnya doang, tapi harus keliatan baik-baik aja terus. Pengen tahu kalian biasanya reset kepala gimana.',
    upvotes: 128,
    comments_count: 24,
    hasVoted: false
  },
  {
    id: 'post-2',
    is_boosted: false,
    tag: '#tanya',
    time: '19 menit lalu',
    author: 'Anonim',
    text: 'Tempat ngeprint yang masih buka jam 9 malam di sekitar kampus di mana ya? Besok pagi dikumpul, printer kos memilih menyerah 😭',
    upvotes: 42,
    comments_count: 11,
    hasVoted: false
  },
  {
    id: 'post-3',
    is_boosted: false,
    tag: '#apresiasi',
    time: '32 menit lalu',
    author: 'Anonim',
    text: 'Buat yang tadi minjemin payung di depan perpus: makasih. Gak tahu siapa kamu, tapi semoga revisimu dikit.',
    upvotes: 86,
    comments_count: 7,
    hasVoted: false
  },
  {
    id: 'post-4',
    is_boosted: false,
    tag: '#akademik',
    time: '47 menit lalu',
    author: 'Anonim',
    text: 'Nyari teman belajar statistik dari nol. Beneran nol, bukan “aku belum belajar” terus nilainya 98. Ada yang mau bareng?',
    upvotes: 63,
    comments_count: 18,
    hasVoted: false
  }
]);

function handleVote(post: any, direction: 'up' | 'down') {
  if (direction === 'up') {
    post.upvotes++;
  } else if (post.upvotes > 0) {
    post.upvotes--;
  }
}

function handleFilterTopic(topic: string) {
  selectedTopic.value = topic;
}

function handleOpenCreate() {
  isCreateOpen.value = true;
  composeSubmitted.value = false;
}

function handleSubmitPost() {
  if (!teksKonten.value.trim()) return;

  const newPost = {
    id: `post-${Date.now()}`,
    is_boosted: isSuperchatSelected.value,
    tag: `#${kategori.value.toLowerCase().replace(/\s+/g, '')}`,
    time: 'Baru saja',
    author: 'Anonim',
    text: teksKonten.value,
    upvotes: 1,
    comments_count: 0,
    hasVoted: true
  };

  if (newPost.is_boosted) {
    demoPosts.value.unshift(newPost);
  } else {
    // Sisipkan setelah postingan superchat pertama
    const pinnedIdx = demoPosts.value.findIndex(p => !p.is_boosted);
    if (pinnedIdx !== -1) {
      demoPosts.value.splice(pinnedIdx, 0, newPost);
    } else {
      demoPosts.value.unshift(newPost);
    }
  }

  composeSubmitted.value = true;
  setTimeout(() => {
    isCreateOpen.value = false;
    teksKonten.value = '';
    composeSubmitted.value = false;
  }, 1200);
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
          MENFESS / SENIN, 12 OKTOBER 2026
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

      <!-- Feed Items List -->
      <div class="space-y-4">
        <article
          v-for="post in demoPosts"
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
            <span class="font-bold text-primary">{{ post.tag }}</span>
            <span class="text-ink-muted">{{ post.author }} · {{ post.time }}</span>
          </div>

          <!-- Post Content (Serif Typography Lora Sesuai Figma) -->
          <p class="font-serif text-base sm:text-[17px] text-ink leading-relaxed my-3 whitespace-pre-line">
            {{ post.text }}
          </p>

          <!-- Interaction Bar (Sesuai Figma) -->
          <div class="flex items-center justify-between pt-3 mt-2 border-t border-border/40 text-xs">
            <div class="flex items-center gap-3">
              <!-- Combined Up/Downvote Pill -->
              <div class="inline-flex items-center bg-surface border border-border rounded-sm overflow-hidden text-xs">
                <button
                  @click="handleVote(post, 'up')"
                  class="px-2.5 py-1 hover:bg-canvas transition-colors flex items-center gap-1 font-semibold text-ink"
                  title="Upvote"
                >
                  <span class="text-primary font-bold">↑</span>
                  <span>{{ post.upvotes }}</span>
                </button>
                <span class="h-3 w-px bg-border"></span>
                <button
                  @click="handleVote(post, 'down')"
                  class="px-2 py-1 hover:bg-canvas text-ink-muted hover:text-ink transition-colors"
                  title="Downvote"
                >
                  ↓
                </button>
              </div>

              <!-- Comment Button -->
              <button class="inline-flex items-center gap-1.5 px-2.5 py-1 text-ink-muted hover:text-ink transition-colors font-medium">
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
      <div class="mt-8 text-center">
        <button class="px-6 py-2.5 bg-surface border border-border text-xs font-semibold text-ink hover:bg-surface-muted transition-colors rounded-sm shadow-xs inline-flex items-center gap-1.5">
          <span>Muat cerita berikutnya</span>
          <span>↓</span>
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
              Jangan cantumkan nama asli, nomor HP, atau NIM siapa pun. Anonimitas publik tidak menghapus tanggung jawab; admin dapat menindak pelanggaran.
            </div>

            <!-- Kategori Selector -->
            <div>
              <label class="block text-xs font-semibold text-ink mb-1">Kategori *</label>
              <select
                v-model="kategori"
                class="w-full p-2.5 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink font-medium"
              >
                <option>Info kampus</option>
                <option>Curhat</option>
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
                Wajib diisi. Nomor HP/NIM akan ditahan oleh filter privasi. Periksa lagi sebelum mengirim.
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
                  Contoh Rp5.000 / 24 jam. Hanya fitur pin yang dibayar, bukan kiriman barang atau akses akun.
                </div>
              </div>
            </div>

            <!-- Turnstile Placeholder (Sesuai Figma) -->
            <div class="p-3 bg-surface border border-border rounded-sm flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <ShieldCheck class="w-4 h-4 text-primary" />
                <div>
                  <div class="font-semibold text-ink">Verifikasi manusia</div>
                  <div class="text-[10px] text-ink-muted">Cloudflare Turnstile · placeholder demo</div>
                </div>
              </div>
              <span class="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 class="w-3.5 h-3.5" /> Terverifikasi
              </span>
            </div>

            <!-- Buttons -->
            <div class="flex items-center gap-3 pt-2">
              <button
                @click="handleSubmitPost"
                :disabled="!teksKonten.trim()"
                class="bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-xs font-semibold px-5 py-2.5 rounded-sm transition-all disabled:opacity-50"
              >
                Kirim untuk ditinjau
              </button>
              <button
                @click="isCreateOpen = false"
                class="bg-surface border border-border text-ink hover:bg-surface-muted text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors"
              >
                Batal
              </button>
            </div>

            <div v-if="composeSubmitted" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-sm">
              ✓ Menfess berhasil dikirim dan ditayangkan!
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
  </div>
</template>
