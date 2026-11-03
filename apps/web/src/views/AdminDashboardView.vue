<script setup lang="ts">
import {
  CreditCard,
  FileText,
  Search,
  ShieldAlert,
  UserX
} from 'lucide-vue-next';
import { ref } from 'vue';

const activeTab = ref<'flagged' | 'text' | 'image' | 'resolved'>('flagged');
const searchQuery = ref('');

const selectedItem = ref({
  id: 'MF-0821',
  type: 'Menfess · teks',
  category: '#curhat',
  time: '12 Okt, 15.42 WIB',
  userInternal: 'U-7F2A · 1 peringatan',
  status: 'Ditahan · teks',
  reason: 'Data pribadi',
  aiScore: '98%',
  textSnippet: 'Yang minjem uang kemarin, tolong balikin ya. Kalau belum dibalikin aku bakal sebar nomor [data disamarkan] dan NIM [data disamarkan] di sini.',
  detection: 'Dugaan doxxing / ancaman menyebarkan identitas',
  regexStatus: 'Pola HP/NIM terdeteksi',
  nlpStatus: 'Probabilitas pelanggaran 98%',
  visionStatus: 'Tidak ada lampiran',
  decisionNote: 'Ancaman penyebaran data pribadi. Minta pengirim memperbaiki isi.'
});

const flaggedItems = ref([
  {
    id: 'MF-0821',
    ref: 'MF-0821 / Menfess · teks',
    title: '“Yang minjem uang kemarin...”',
    reason: 'Data pribadi',
    score: '98%',
    wib: '15.42',
    isSevere: true
  },
  {
    id: 'MK-0148',
    ref: 'MK-0148 / Marketplace · gambar',
    title: 'Gunting untuk tugas maket',
    reason: 'Objek perlu cek',
    score: '81%',
    wib: '15.39',
    isSevere: true
  },
  {
    id: 'MF-0819',
    ref: 'MF-0819 / Menfess · teks',
    title: '“Teman kelompokku tuh...”',
    reason: 'Serangan personal',
    score: '76%',
    wib: '15.36',
    isSevere: true
  },
  {
    id: 'LF-0093',
    ref: 'LF-0093 / Lost & Found · gambar',
    title: 'Kartu ditemukan di kantin',
    reason: 'Identitas di foto',
    score: '94%',
    wib: '15.31',
    isSevere: true
  },
  {
    id: 'MF-0817',
    ref: 'MF-0817 / Menfess · teks',
    title: '“Mau tukeran catatan UTS...”',
    reason: 'Pola kontak',
    score: '67%',
    wib: '15.28',
    isSevere: false
  },
  {
    id: 'MK-0146',
    ref: 'MK-0146 / Marketplace · gambar',
    title: 'Buku kuliah, foto sampul',
    reason: 'Perlu verifikasi',
    score: '62%',
    wib: '15.24',
    isSevere: false
  }
]);

const auditLogs = ref([
  {
    time: '15.37',
    text: 'MF-0812 · Ditolak · serangan personal',
    meta: 'Mod-02 / Terverifikasi',
    action: 'Arsipkan'
  },
  {
    time: '15.29',
    text: 'MK-0140 · Disetujui · salah deteksi gambar',
    meta: 'Mod-01 / Terverifikasi',
    action: 'Arsipkan'
  },
  {
    time: '15.12',
    text: 'U-4B9C · Diblokir · pelanggaran berulang',
    meta: 'Mod-02 / Diarsipkan',
    action: 'Lihat'
  }
]);

const transactions = ref([
  {
    type: 'Superchat',
    ref: 'DEMO-401 · nominal contoh',
    amount: 'Rp5.000',
    status: 'Settlement',
    statusClass: 'bg-badge-foundBg text-badge-foundText'
  },
  {
    type: 'Boost listing',
    ref: 'DEMO-402 · nominal contoh',
    amount: 'Rp3.000',
    status: 'Pending',
    statusClass: 'bg-badge-superchatBg text-badge-superchatText'
  },
  {
    type: 'Pinned Post',
    ref: 'DEMO-403 · nominal contoh',
    amount: 'Rp5.000',
    status: 'Expired',
    statusClass: 'bg-surface-muted text-ink-muted'
  }
]);

const actionFeedback = ref('');

function handleApprove() {
  actionFeedback.value = `✓ Kiriman ${selectedItem.value.id} disetujui dan ditayangkan di feed.`;
  setTimeout(() => actionFeedback.value = '', 3000);
}

function handleReject() {
  actionFeedback.value = `✕ Kiriman ${selectedItem.value.id} ditolak dan dicatat di log audit.`;
  setTimeout(() => actionFeedback.value = '', 3000);
}

function handleBan() {
  actionFeedback.value = `⚠ Akun pengirim ${selectedItem.value.id} telah diblokir secara permanen.`;
  setTimeout(() => actionFeedback.value = '', 3000);
}
</script>

<template>
  <div class="flex items-start gap-8">
    <!-- Left Moderator Sidebar (Sesuai Figma 13_Admin_Moderation_Desktop.png) -->
    <aside class="w-60 shrink-0 hidden lg:flex flex-col gap-6 text-xs text-ink select-none pr-4">
      <div class="space-y-2.5">
        <div class="text-[11px] font-bold tracking-wider text-ink-muted uppercase">
          RUANG MODERATOR
        </div>
        <div class="space-y-1">
          <button class="w-full flex items-center gap-3 px-3 py-2 rounded-sm bg-primary-soft text-primary font-bold text-left transition-colors">
            <ShieldAlert class="w-4 h-4" />
            <span>Antrean moderasi</span>
          </button>
          <button class="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-ink hover:bg-surface-muted font-medium text-left transition-colors">
            <FileText class="w-4 h-4" />
            <span>Log audit</span>
          </button>
          <button class="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-ink hover:bg-surface-muted font-medium text-left transition-colors">
            <CreditCard class="w-4 h-4" />
            <span>Transaksi</span>
          </button>
          <button class="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-ink hover:bg-surface-muted font-medium text-left transition-colors">
            <UserX class="w-4 h-4" />
            <span>Pengguna diblokir</span>
          </button>
        </div>
      </div>

      <div class="border-t border-border"></div>

      <!-- Links (Sesuai Figma) -->
      <div class="space-y-2 text-xs text-ink-muted">
        <a href="#pedoman" class="block font-semibold text-ink hover:underline">
          Pedoman komunitas ↗
        </a>
        <a href="#faq" class="block hover:text-ink transition-colors">
          Bantuan & FAQ
        </a>
        <a href="#changelog" class="block hover:text-ink transition-colors">
          Catatan pembaruan
        </a>
      </div>

      <div class="text-[11px] text-ink-muted leading-relaxed mt-auto pt-4 border-t border-border">
        Setiap keputusan dicatat. Log terverifikasi hanya dapat diarsipkan.
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 min-w-0 space-y-8">
      <!-- Header Section -->
      <div>
        <div class="text-[11px] font-semibold text-ink-muted tracking-wider uppercase mb-1">
          ADMIN / 12 OKTOBER 2026
        </div>
        <div class="flex flex-wrap items-baseline gap-3">
          <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight">
            Ruang jaga komunitas.
          </h1>
          <span class="px-2.5 py-0.5 bg-badge-superchatBg text-badge-superchatText text-xs font-bold rounded-xs">
            6 perlu tinjauan
          </span>
        </div>
        <p class="text-xs sm:text-sm text-ink-muted mt-1.5">
          Tinjau kiriman yang ditandai. Utamakan konteks, keamanan, dan jejak keputusan yang jelas.
        </p>
      </div>

      <!-- Search Input + Guide Button -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div class="relative flex-1">
          <Search class="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari ID kiriman, alasan, atau akun internal..."
            class="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink placeholder:text-ink-muted transition-colors"
          />
        </div>

        <button class="px-4 py-2.5 bg-surface border border-border text-ink hover:bg-surface-muted text-xs font-semibold rounded-sm transition-colors flex items-center justify-center gap-1.5 shrink-0">
          <span>Pedoman moderasi</span>
          <span class="text-xs">↗</span>
        </button>
      </div>

      <!-- Action Feedback Banner -->
      <div v-if="actionFeedback" class="p-3 bg-surface border border-ink text-ink text-xs font-semibold rounded-sm shadow-xs">
        {{ actionFeedback }}
      </div>

      <!-- Filter Tabs (Sesuai Figma) -->
      <div class="flex items-center gap-6 border-b border-border pb-2.5 text-xs font-medium">
        <button
          @click="activeTab = 'flagged'"
          class="pb-1 transition-colors"
          :class="activeTab === 'flagged' ? 'text-ink font-bold border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          Antrean ditandai (6)
        </button>
        <button
          @click="activeTab = 'text'"
          class="pb-1 transition-colors"
          :class="activeTab === 'text' ? 'text-ink font-bold border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          Teks (3)
        </button>
        <button
          @click="activeTab = 'image'"
          class="pb-1 transition-colors"
          :class="activeTab === 'image' ? 'text-ink font-bold border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          Gambar (3)
        </button>
        <button
          @click="activeTab = 'resolved'"
          class="pb-1 transition-colors"
          :class="activeTab === 'resolved' ? 'text-ink font-bold border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          Selesai ditinjau
        </button>
      </div>

      <!-- Table & Review Workbench Layout (Sesuai Figma 13) -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <!-- Left: Flagged Queue Table -->
        <div class="xl:col-span-7 space-y-4">
          <div class="flex items-center justify-between text-[11px] text-ink-muted font-medium">
            <span>Menunggu · Terlama dahulu ↓</span>
            <span>Regex / NLP / Vision</span>
          </div>

          <!-- Table Container -->
          <div class="bg-surface border border-border rounded-sm overflow-hidden text-xs">
            <div class="grid grid-cols-12 gap-2 p-3 bg-canvas/60 border-b border-border font-bold text-ink-muted text-[11px] uppercase tracking-wider">
              <div class="col-span-6">KIRIMAN</div>
              <div class="col-span-3">ALASAN</div>
              <div class="col-span-2 text-right">SKOR</div>
              <div class="col-span-1 text-right">WIB</div>
            </div>

            <div class="divide-y divide-border">
              <div
                v-for="item in flaggedItems"
                :key="item.id"
                @click="selectedItem.id = item.id; selectedItem.reason = item.reason; selectedItem.aiScore = item.score"
                class="grid grid-cols-12 gap-2 p-3.5 hover:bg-canvas/50 transition-colors cursor-pointer items-center"
                :class="{ 'bg-primary-soft/50': selectedItem.id === item.id }"
              >
                <!-- Kiriman -->
                <div class="col-span-6">
                  <div class="text-[10px] text-ink-muted leading-tight mb-0.5">{{ item.ref }}</div>
                  <div class="font-bold text-ink text-xs line-clamp-1">{{ item.title }}</div>
                </div>

                <!-- Alasan -->
                <div class="col-span-3 font-medium text-xs text-badge-lostText">
                  {{ item.reason }}
                </div>

                <!-- Skor AI -->
                <div class="col-span-2 text-right font-bold text-xs" :class="item.isSevere ? 'text-badge-lostText' : 'text-ink'">
                  {{ item.score }}
                </div>

                <!-- Waktu WIB -->
                <div class="col-span-1 text-right text-[11px] text-ink-muted font-mono">
                  {{ item.wib }}
                </div>
              </div>
            </div>
          </div>

          <!-- Pratinjau Gambar Ditandai Box (Sesuai Figma 13) -->
          <div class="p-4 bg-surface border border-border rounded-sm flex items-start gap-4">
            <div class="w-16 h-16 bg-surface-muted rounded-xs overflow-hidden shrink-0 border border-border">
              <img
                src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=120&auto=format&fit=crop&q=80"
                alt="gunting"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="text-xs">
              <div class="font-bold text-ink mb-0.5">MK-0148 · Pratinjau gambar ditandai</div>
              <div class="text-primary font-semibold text-[11px] mb-1">Vision: objek perlu cek · 81%</div>
              <p class="text-[11px] text-ink-muted leading-relaxed">
                Gunting kerajinan dapat terdeteksi sebagai benda tajam. Periksa foto dan konteks listing sebelum memutuskan.
              </p>
            </div>
          </div>
        </div>

        <!-- Right: Detail Review Box (Sesuai Figma 13) -->
        <div class="xl:col-span-5 bg-surface border border-border p-5 rounded-sm space-y-4">
          <div class="flex items-center justify-between text-xs">
            <span class="font-mono font-bold text-ink">{{ selectedItem.id }}</span>
            <span class="px-2 py-0.5 bg-badge-superchatBg text-badge-superchatText font-bold text-[10px] rounded-xs uppercase">
              {{ selectedItem.status }}
            </span>
          </div>

          <h2 class="font-serif text-xl sm:text-2xl text-ink font-normal leading-snug">
            Tinjau konteks, bukan cuma skor.
          </h2>

          <div class="text-[11px] text-ink-muted space-y-0.5 pb-2 border-b border-border">
            <div>{{ selectedItem.type }} · {{ selectedItem.time }}</div>
            <div>Akun internal {{ selectedItem.userInternal }}</div>
          </div>

          <!-- Redacted Text Box (Sesuai Figma) -->
          <div class="p-3.5 bg-badge-lostBg/60 border border-badge-lostText/20 rounded-xs space-y-1.5">
            <div class="text-[10px] font-bold text-badge-lostText tracking-wider uppercase">
              PRATINJAU TEKS / DATA DISAMARKAN
            </div>
            <p class="font-serif text-xs text-ink leading-relaxed">
              {{ selectedItem.textSnippet }}
            </p>
          </div>

          <!-- Detection Points -->
          <div class="space-y-1.5 text-xs">
            <div class="font-bold text-badge-lostText text-[11px]">
              {{ selectedItem.detection }}
            </div>
            <div class="text-[11px] text-ink grid grid-cols-3 gap-2 pt-1 border-t border-border">
              <div>
                <span class="text-ink-muted block text-[10px]">Regex:</span>
                <span class="font-medium">{{ selectedItem.regexStatus }}</span>
              </div>
              <div>
                <span class="text-ink-muted block text-[10px]">NLP:</span>
                <span class="font-bold text-badge-lostText">{{ selectedItem.nlpStatus }}</span>
              </div>
              <div>
                <span class="text-ink-muted block text-[10px]">Vision:</span>
                <span class="font-medium text-ink-muted">{{ selectedItem.visionStatus }}</span>
              </div>
            </div>
            <div class="text-[10px] text-ink-muted leading-normal pt-1">
              Skor adalah sinyal, bukan keputusan. Tinjauan manusia menentukan tindakan akhir.
            </div>
          </div>

          <!-- Decision Note Input -->
          <div>
            <label class="block text-xs font-semibold text-ink mb-1">Alasan keputusan *</label>
            <textarea
              v-model="selectedItem.decisionNote"
              rows="3"
              class="w-full p-2.5 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink leading-relaxed"
            ></textarea>
          </div>

          <!-- Action Buttons: Setujui / Tolak / Blokir (Sesuai Figma) -->
          <div class="flex items-center gap-2 pt-1">
            <button
              @click="handleApprove"
              class="flex-1 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-xs font-semibold py-2.5 rounded-sm transition-all"
            >
              Setujui
            </button>
            <button
              @click="handleReject"
              class="flex-1 bg-badge-lostText hover:bg-red-800 active:scale-[0.99] text-white text-xs font-semibold py-2.5 rounded-sm transition-all"
            >
              Tolak
            </button>
            <button
              @click="handleBan"
              class="px-3.5 py-2.5 bg-surface border border-badge-lostText text-badge-lostText hover:bg-badge-lostBg text-xs font-semibold rounded-sm transition-colors"
            >
              Blokir
            </button>
          </div>

          <p class="text-[10px] text-ink-muted leading-tight">
            Blokir membatasi akun, bukan hanya pos ini. Alasan wajib dicatat. Semua tindakan masuk ke log audit.
          </p>
        </div>
      </div>

      <!-- Bottom Tables: Log Audit & Transaksi Fitur (Sesuai Figma 13) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-border">
        <!-- Log Audit -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-serif text-xl text-ink font-normal">Log audit</h3>
            <a href="#audit" class="text-xs text-primary font-semibold hover:underline">
              Buka semua ↗
            </a>
          </div>

          <div class="bg-surface border border-border rounded-sm divide-y divide-border text-xs">
            <div
              v-for="log in auditLogs"
              :key="log.time"
              class="p-3 flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-2.5">
                <span class="font-mono text-ink-muted text-[11px]">{{ log.time }}</span>
                <div>
                  <div class="font-semibold text-ink text-xs">{{ log.text }}</div>
                  <div class="text-[10px] text-ink-muted">{{ log.meta }}</div>
                </div>
              </div>
              <button class="text-[11px] text-primary font-semibold hover:underline shrink-0">
                {{ log.action }}
              </button>
            </div>
          </div>

          <!-- Arsip Saja Box (Sesuai Figma) -->
          <div class="p-3.5 bg-primary-soft rounded-xs text-xs text-ink leading-relaxed">
            <span class="font-bold text-primary block mb-0.5">Arsip saja, bukan hapus.</span>
            Log pelanggaran terverifikasi tidak dapat dihapus. Arsip mempertahankan jejak keputusan dan alasan.
          </div>
        </div>

        <!-- Transaksi Fitur (Midtrans QRIS) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-serif text-xl text-ink font-normal">Transaksi fitur</h3>
            <a href="#transaksi" class="text-xs text-primary font-semibold hover:underline">
              Buka semua ↗
            </a>
          </div>

          <div class="bg-surface border border-border rounded-sm divide-y divide-border text-xs">
            <div
              v-for="trx in transactions"
              :key="trx.type"
              class="p-3 flex items-center justify-between gap-3"
            >
              <div>
                <div class="font-bold text-ink text-xs">{{ trx.type }}</div>
                <div class="text-[10px] text-ink-muted">{{ trx.ref }}</div>
              </div>

              <div class="flex items-center gap-3">
                <span class="font-bold text-ink text-xs">{{ trx.amount }}</span>
                <span
                  class="px-2 py-0.5 rounded-xs font-bold text-[10px] uppercase"
                  :class="trx.statusClass"
                >
                  {{ trx.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="text-[11px] text-ink-muted leading-relaxed">
            Pembayaran diverifikasi melalui notifikasi Midtrans. Status Settlement tidak mengesampingkan moderasi konten.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
