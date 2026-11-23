<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Lock,
  Search,
  Shield,
  ShieldCheck,
  Sparkles
} from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

type TabKey = 'faq' | 'privasi' | 'pedoman';

// Active tab determined by path or route param
const activeTab = ref<TabKey>('faq');

function syncTabFromRoute() {
  if (route.path.includes('privasi')) {
    activeTab.value = 'privasi';
  } else if (route.path.includes('pedoman')) {
    activeTab.value = 'pedoman';
  } else {
    activeTab.value = 'faq';
  }
}

watch(() => route.path, syncTabFromRoute, { immediate: true });

function setTab(tab: TabKey) {
  activeTab.value = tab;
  if (tab === 'privasi') router.push('/privasi');
  else if (tab === 'pedoman') router.push('/pedoman');
  else router.push('/bantuan');
}

// Search state in FAQ
const searchQuery = ref('');

// Accordion open/close state
const openFaqIndex = ref<number | null>(0);

function toggleFaq(index: number) {
  openFaqIndex.value = openFaqIndex.value === index ? null : index;
}

const faqs = [
  {
    q: 'Apa itu Menfessin Aja?',
    category: 'Umum',
    a: 'Menfessin Aja adalah platform hyperlocal komunitas kampus resmi yang menggabungkan forum curhat & kabar anonim (Menfess), etalase jual-beli barang bekas antar mahasiswa (Marketplace C2C), serta papan laporan barang hilang & ditemukan (Lost and Found).'
  },
  {
    q: 'Apakah benar identitas saya 100% anonim saat mengirim menfess?',
    category: 'Privasi',
    a: 'Ya, nama dan profil akun Anda tidak akan pernah ditampilkan pada postingan menfess publik. Sistem kami juga dilengkapi filter Regex cerdas (NFR-002) yang otomatis menyamarkan NIM kampus (1124xxxx ➔ 1124****) dan nomor telepon seluler (0812****09) agar data pribadi Anda dan orang lain tidak tersebar.'
  },
  {
    q: 'Mengapa menfess saya berstatus "Sedang ditinjau oleh admin" (Flagged)?',
    category: 'Moderasi',
    a: 'Sistem kami menggunakan kecerdasan buatan Juan Router AI NLP untuk menganalisis setiap pesan sebelum tayang. Jika konten terindikasi mengandung ujaran kebencian, kata makian kasar ekstrem, ancaman fisik, pelecehan, atau upaya pembocoran rahasia (doxxing) dengan skor AI ≥ 0.70, postingan otomatis ditahan agar tidak merugikan civitas kampus dan harus disetujui admin terlebih dahulu.'
  },
  {
    q: 'Bagaimana cara kerja Superchat / Pinned Post?',
    category: 'Fitur',
    a: 'Superchat / Pinned Post adalah fitur penyematan menfess di posisi teratas linimasa selama 24 jam. Pembayaran dilakukan secara praktis menggunakan QRIS dinamis via Midtrans Snap. Konten yang disematkan tetap wajib mematuhi pedoman komunitas.'
  },
  {
    q: 'Bagaimana cara transaksi di Marketplace?',
    category: 'Marketplace',
    a: 'Menfessin Aja tidak menyediakan pembayaran escrow atau jasa kurir pengiriman. Platform kami langsung menghubungkan Anda ke nomor WhatsApp penjual. Pembayaran dan serah terima barang disepakati langsung oleh kedua pihak dengan bertemu di area kampus yang aman (seperti kantin, perpus, atau lobi fakultas).'
  },
  {
    q: 'Bagaimana alur penggunaan fitur Lost & Found?',
    category: 'Lost & Found',
    a: 'Bagi yang menemukan barang, tuliskan ciri-ciri serta pos keamanan / petugas tempat barang dititipkan. Bagi yang kehilangan, tuliskan perkiraan lokasi dan waktu tercecer. Ketika barang sudah kembali ke pemilik aslinya, pelapor dapat menekan tombol "Tandai Selesai".'
  },
  {
    q: 'Apakah saya bisa diblokir (banned) dari platform?',
    category: 'Aturan',
    a: 'Ya. Admin memiliki hak mencabut akses dan memblokir akun yang terbukti berulang kali melanggar Pedoman Komunitas, melakukan penipuan di marketplace, atau menyebarkan konten berbahaya.'
  }
];

const filteredFaqs = computed(() => {
  if (!searchQuery.value.trim()) return faqs;
  const q = searchQuery.value.toLowerCase();
  return faqs.filter(
    (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
  );
});
</script>

<template>
  <div class="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 w-full max-w-full">
    <!-- Left Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 min-w-0 w-full max-w-4xl">
      <!-- Header Section -->
      <div class="mb-6">
        <div class="text-[11px] font-semibold text-ink-muted tracking-wider uppercase mb-1">
          PUSAT INFORMASI / BANTUAN & LEGAL
        </div>
        <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight">
          Informasi & Pedoman.
        </h1>
        <p class="text-xs sm:text-sm text-ink-muted mt-1.5">
          Pelajari cara kerja platform, pedoman etika komunitas kampus, dan perlindungan privasimu.
        </p>
      </div>

      <!-- Navigation Tabs (Sesuai Figma Style) -->
      <div class="flex items-center gap-6 border-b border-border pb-2.5 mb-6 text-xs font-semibold">
        <button
          @click="setTab('faq')"
          class="pb-1 transition-colors flex items-center gap-1.5"
          :class="activeTab === 'faq' ? 'text-ink border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          <HelpCircle class="w-3.5 h-3.5" />
          <span>Bantuan & FAQ</span>
        </button>
        <button
          @click="setTab('pedoman')"
          class="pb-1 transition-colors flex items-center gap-1.5"
          :class="activeTab === 'pedoman' ? 'text-ink border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          <FileText class="w-3.5 h-3.5" />
          <span>Pedoman Komunitas</span>
        </button>
        <button
          @click="setTab('privasi')"
          class="pb-1 transition-colors flex items-center gap-1.5"
          :class="activeTab === 'privasi' ? 'text-ink border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          <Lock class="w-3.5 h-3.5" />
          <span>Kebijakan Privasi</span>
        </button>
      </div>

      <!-- ================= TAB 1: BANTUAN & FAQ ================= -->
      <div v-if="activeTab === 'faq'" class="space-y-6">
        <!-- Search bar -->
        <div class="relative">
          <Search class="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari pertanyaan... (misal: sensor NIM, superchat, COD)"
            class="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink placeholder:text-ink-muted/80"
          />
        </div>

        <!-- FAQ Accordion List -->
        <div class="space-y-3">
          <div
            v-for="(item, idx) in filteredFaqs"
            :key="idx"
            class="bg-surface border border-border rounded-sm overflow-hidden transition-colors"
            :class="openFaqIndex === idx ? 'border-primary/40' : 'hover:border-ink/30'"
          >
            <button
              @click="toggleFaq(idx)"
              class="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
            >
              <div class="flex items-center gap-2.5">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs bg-primary-soft text-primary">
                  {{ item.category }}
                </span>
                <span class="font-semibold text-xs text-ink">{{ item.q }}</span>
              </div>
              <ChevronUp v-if="openFaqIndex === idx" class="w-4 h-4 text-ink-muted shrink-0" />
              <ChevronDown v-else class="w-4 h-4 text-ink-muted shrink-0" />
            </button>

            <div
              v-show="openFaqIndex === idx"
              class="px-4 pb-4 pt-1 text-xs text-ink-muted font-sans leading-relaxed border-t border-border/40"
            >
              {{ item.a }}
            </div>
          </div>
        </div>

        <!-- Quick Help Card -->
        <div class="p-5 bg-primary-soft border border-primary/20 rounded-sm mt-8 flex items-start gap-4">
          <Sparkles class="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div class="text-xs">
            <h3 class="font-bold text-ink mb-1">Masih butuh bantuan lain?</h3>
            <p class="text-ink-muted leading-relaxed mb-3">
              Jika mengalami kendala teknis atau ingin melaporkan penyalahgunaan akun, silakan hubungi tim administrator kampus kami.
            </p>
            <a
              href="mailto:admin@menfessinaja.ac.id"
              class="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <span>Hubungi admin@menfessinaja.ac.id</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>

      <!-- ================= TAB 2: PEDOMAN KOMUNITAS ================= -->
      <div v-else-if="activeTab === 'pedoman'" class="space-y-6">
        <div class="bg-surface border border-border p-6 rounded-sm space-y-5 text-xs text-ink leading-relaxed">
          <div class="border-b border-border pb-4">
            <h2 class="font-serif text-2xl text-ink font-normal mb-1">Pedoman Komunitas Kampus</h2>
            <p class="text-ink-muted text-[11px]">Terakhir diperbarui: Oktober 2026</p>
          </div>

          <div>
            <h3 class="font-bold text-sm text-ink mb-1.5 flex items-center gap-1.5">
              <span class="w-2 h-2 bg-primary rounded-full"></span>
              1. Menjaga Anonimitas Tanpa Melepas Tanggung Jawab
            </h3>
            <p class="text-ink-muted pl-3.5">
              Fitur anonimitas hadir agar mahasiswa dapat bebas berdiskusi, bertukar cerita, dan menyuarakan pendapat secara jujur. Namun, anonimitas tidak menghapus norma kesopanan dan hukum. Segala bentuk intimidasi (*cyberbullying*) tidak ditoleransi.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-sm text-ink mb-1.5 flex items-center gap-1.5">
              <span class="w-2 h-2 bg-primary rounded-full"></span>
              2. Larangan Pembocoran Data Pribadi (Anti-Doxxing)
            </h3>
            <p class="text-ink-muted pl-3.5">
              Dilarang keras mempublikasikan identitas orang lain (nama lengkap, alamat kos, akun media sosial pribadi, KTP, atau foto tanpa izin) dengan maksud mempermalukan atau menyerang.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-sm text-ink mb-1.5 flex items-center gap-1.5">
              <span class="w-2 h-2 bg-primary rounded-full"></span>
              3. Etika Jual-Beli Marketplace
            </h3>
            <p class="text-ink-muted pl-3.5">
              Penjual wajib mendeskripsikan kondisi barang secara jujur (apakah ada minus, lecet, atau kelengkapan berkurang). Dilarang menjual barang terlarang, senjata tajam, miras, obat-obatan tanpa resep, atau barang hasil curian.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-sm text-ink mb-1.5 flex items-center gap-1.5">
              <span class="w-2 h-2 bg-primary rounded-full"></span>
              4. Kejujuran di Papan Lost and Found
            </h3>
            <p class="text-ink-muted pl-3.5">
              Papan barang hilang & ditemukan bertujuan untuk saling tolong-menolong antar mahasiswa. Mengklaim barang yang bukan hak miliknya secara curang merupakan pelanggaran berat.
            </p>
          </div>

          <div class="p-4 bg-amber-50 border border-amber-200 rounded-sm text-amber-900 mt-4">
            <span class="font-bold block mb-1">Konsekuensi Pelanggaran:</span>
            Akun yang terbukti melanggar akan langsung berstatus <strong class="text-red-700">Banned</strong> oleh admin, sesi token dicabut, dan tidak dapat lagi mengakses layanan Menfessin Aja.
          </div>
        </div>
      </div>

      <!-- ================= TAB 3: KEBIJAKAN PRIVASI ================= -->
      <div v-else-if="activeTab === 'privasi'" class="space-y-6">
        <div class="bg-surface border border-border p-6 rounded-sm space-y-5 text-xs text-ink leading-relaxed">
          <div class="border-b border-border pb-4">
            <h2 class="font-serif text-2xl text-ink font-normal mb-1">Kebijakan Privasi Data Pengguna</h2>
            <p class="text-ink-muted text-[11px]">Sesuai Standar Kebutuhan SRS NFR-002 & NFR-003</p>
          </div>

          <div class="flex items-start gap-3 p-3.5 bg-primary-soft border border-primary/20 rounded-sm">
            <ShieldCheck class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <span class="font-bold text-primary block mb-0.5">Penyamaran Otomatis Regex (NFR-002: 100%)</span>
              Setiap kali Anda mengirim teks yang mengandung NIM kampus format <code class="bg-surface px-1 py-0.5 rounded font-mono">1124xxxx</code> atau nomor telepon seluler Indonesia, sistem otomatis mengubahnya menjadi bentuk tersamar sebelum tersimpan di basis data.
            </div>
          </div>

          <div>
            <h3 class="font-bold text-sm text-ink mb-1.5 flex items-center gap-1.5">
              <Shield class="w-3.5 h-3.5 text-ink-muted" />
              1. Informasi yang Kami Kumpulkan
            </h3>
            <p class="text-ink-muted pl-5">
              Kami hanya menyimpan alamat email dan kata sandi yang telah dienkripsi dengan algoritma satu arah (*Bcrypt*) pada saat pendaftaran akun. Kami tidak menyimpan nomor rekening atau data finansial pengguna.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-sm text-ink mb-1.5 flex items-center gap-1.5">
              <Shield class="w-3.5 h-3.5 text-ink-muted" />
              2. Otentikasi dan Keamanan Sesi
            </h3>
            <p class="text-ink-muted pl-5">
              Sesi login dilindungi dengan JSON Web Token (JWT) terenkripsi HS256 yang divalidasi pada setiap permintaan API privat. Akses bot ilegal diblokir di sisi depan menggunakan Cloudflare Turnstile.
            </p>
          </div>

          <div>
            <h3 class="font-bold text-sm text-ink mb-1.5 flex items-center gap-1.5">
              <Shield class="w-3.5 h-3.5 text-ink-muted" />
              3. Penyimpanan Data
            </h3>
            <p class="text-ink-muted pl-5">
              Semua data relasional disimpan dalam basis data PostgreSQL Supabase dengan Row Level Security (RLS) serta audit log permanen untuk setiap tindakan moderasi administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
