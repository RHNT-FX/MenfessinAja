<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import {
  Flag,
  Plus,
  Search,
  X
} from 'lucide-vue-next';
import { computed, ref } from 'vue';

const searchQuery = ref('');
const activeCategory = ref('Semua');
const selectedProduct = ref<any>(null);

const products = ref([
  {
    id: 'prod-1',
    title: 'Fujifilm X-A3 + kit lens 16–50 mm',
    shortTitle: 'Fujifilm X-A3 + kit lens',
    price: 2800000,
    category: 'Elektronik',
    condition: 'Bekas, kondisi baik',
    negotiable: 'Bisa nego wajar',
    location: 'Dekat gerbang utama',
    is_boosted: true,
    status: 'Tersedia',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    description: 'Dijual karena jarang kepakai. Semua tombol normal, layar mulus. Termasuk baterai, charger, strap, dan tas kecil. Boleh cek unit dulu sebelum deal.',
    sellerWa: '6281234567890'
  },
  {
    id: 'prod-2',
    title: 'Lampu meja belajar vintage',
    shortTitle: 'Lampu meja belajar',
    price: 75000,
    category: 'Perlengkapan kos',
    condition: 'Bekas',
    negotiable: 'Harga pas',
    location: 'Area kos selatan',
    is_boosted: false,
    status: 'Tersedia',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    description: 'Bohlam hangat LED hemat daya. Kabel masih aman tanpa sambungan, switch putar lancar.',
    sellerWa: '6289876543210'
  },
  {
    id: 'prod-3',
    title: 'Paket buku teks ekonomi & statistika',
    shortTitle: 'Paket buku ekonomi',
    price: 120000,
    category: 'Buku',
    condition: 'Bekas (banyak coretan pensil)',
    negotiable: 'Bisa nego',
    location: 'Perpustakaan',
    is_boosted: false,
    status: 'Tersedia',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    description: 'Kumpulan 3 buku acuan semester awal. Halaman lengkap, cocok buat yang butuh referensi offline.',
    sellerWa: '6281234567890'
  },
  {
    id: 'prod-4',
    title: 'Kalkulator scientific fx-991EX',
    shortTitle: 'Kalkulator scientific',
    price: 95000,
    category: 'Elektronik',
    condition: 'Bekas mulus',
    negotiable: 'Pas',
    location: 'Kantin',
    is_boosted: false,
    status: 'Terjual',
    image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80',
    description: 'Layar jernih, solar panel aktif, tombol empuk normal semua.',
    sellerWa: '6281234567890'
  },
  {
    id: 'prod-5',
    title: 'Kursi lipat kayu, masih kokoh',
    shortTitle: 'Kursi lipat, masih kokoh',
    price: 90000,
    category: 'Perlengkapan kos',
    condition: 'Bekas',
    negotiable: 'Bisa nego',
    location: 'Area kos utara',
    is_boosted: false,
    status: 'Tersedia',
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&auto=format&fit=crop&q=80',
    description: 'Kayu jati belanda, engsel besi kuat, gampang dilipat pas gak dipakai.',
    sellerWa: '6281234567890'
  },
  {
    id: 'prod-6',
    title: 'Keyboard mechanical 60% Red Switch',
    shortTitle: 'Keyboard mechanical 60%',
    price: 250000,
    category: 'Elektronik',
    condition: 'Bekas terawat',
    negotiable: 'Bisa nego tipis',
    location: 'Dekat gerbang utama',
    is_boosted: false,
    status: 'Tersedia',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    description: 'Kabel Type-C coiled bawaan, RGB backlight lancar, switch responsif tanpa double-click.',
    sellerWa: '6281234567890'
  }
]);

// Set default selected product ke item pertama agar detail drawer tampil seperti di Figma
selectedProduct.value = products.value[0];

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchCat = activeCategory.value === 'Semua' || p.category === activeCategory.value;
    const matchSearch = !searchQuery.value || p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchCat && matchSearch;
  });
});

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}
</script>

<template>
  <div class="flex items-start gap-8">
    <!-- Left Sidebar (Sesuai Figma) -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 min-w-0">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div class="text-[11px] font-semibold text-ink-muted tracking-wider uppercase mb-1">
            MARKETPLACE / SEKITAR KAMPUS
          </div>
          <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight">
            Barang pindah tangan.
          </h1>
          <p class="text-xs sm:text-sm text-ink-muted mt-1.5">
            Dari meja kos ke pemilik baru. Temukan yang kamu butuhkan, dekat-dekat aja.
          </p>
        </div>

        <button
          class="bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-all flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Jual barang</span>
        </button>
      </div>

      <!-- Search Input Bar (Sesuai Figma) -->
      <div class="mb-5">
        <div class="relative w-full">
          <Search class="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kamera, buku, perlengkapan kos..."
            class="w-full pl-10 pr-4 py-2.5 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink placeholder:text-ink-muted transition-colors"
          />
        </div>
      </div>

      <!-- Filter Categories Tabs (Sesuai Figma) -->
      <div class="flex items-center gap-6 border-b border-border pb-2.5 mb-5 text-xs font-medium">
        <button
          v-for="cat in ['Semua', 'Elektronik', 'Buku', 'Perlengkapan kos']"
          :key="cat"
          @click="activeCategory = cat"
          class="pb-1 transition-colors"
          :class="activeCategory === cat ? 'text-ink font-bold border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Count & Sort Label -->
      <div class="flex items-center justify-between text-xs text-ink-muted mb-4 font-medium">
        <span>{{ filteredProducts.length }} barang di sekitar kamu</span>
        <button class="hover:text-ink flex items-center gap-1">
          <span>Terbaru</span>
          <span>↓</span>
        </button>
      </div>

      <!-- Products Grid & Side Drawer Layout (Sesuai Figma 07) -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- Products Grid List -->
        <div class="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="item in filteredProducts"
            :key="item.id"
            @click="selectedProduct = item"
            class="bg-surface border border-border p-3.5 rounded-sm cursor-pointer hover:border-ink/40 transition-all flex flex-col justify-between group"
            :class="{ 'ring-1 ring-primary': selectedProduct?.id === item.id }"
          >
            <!-- Product Photo -->
            <div class="aspect-4/3 w-full bg-surface-muted overflow-hidden rounded-xs mb-3 relative">
              <img
                :src="item.image"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
            </div>

            <!-- Meta & Title -->
            <div class="flex-1">
              <div class="flex items-center justify-between text-[11px] text-ink-muted mb-1">
                <span>{{ item.category }}</span>
                <span
                  v-if="item.is_boosted"
                  class="px-1.5 py-0.2 bg-primary-soft text-primary font-bold text-[10px] rounded-xs"
                >
                  Boost
                </span>
                <span
                  v-else-if="item.status === 'Terjual'"
                  class="px-1.5 py-0.2 bg-surface-muted text-ink-muted font-bold text-[10px] rounded-xs"
                >
                  Terjual
                </span>
              </div>

              <h3 class="font-bold text-xs text-ink line-clamp-1 mb-1">
                {{ item.shortTitle }}
              </h3>

              <div class="text-sm font-bold text-ink">
                {{ formatRupiah(item.price) }}
              </div>

              <div class="text-[11px] text-ink-muted mt-1">
                {{ item.location }}
              </div>
            </div>

            <div class="pt-2 mt-2 border-t border-border/40 text-[11px] text-primary font-semibold flex items-center gap-1">
              <span>Detail dipilih</span>
              <span class="text-[10px]">↗</span>
            </div>
          </div>

          <!-- Load More Button -->
          <div class="sm:col-span-2 text-center py-4">
            <button class="w-full py-2.5 bg-surface border border-border text-xs font-semibold text-ink hover:bg-surface-muted transition-colors rounded-sm inline-flex items-center justify-center gap-1.5">
              <span>Lihat barang lainnya</span>
              <span>↓</span>
            </button>
          </div>
        </div>

        <!-- Right Side: Product Detail Panel (Sesuai Figma 07) -->
        <div
          v-if="selectedProduct"
          class="xl:col-span-5 bg-surface border border-border p-5 rounded-sm flex flex-col justify-between"
        >
          <div>
            <!-- Top bar -->
            <div class="flex items-center justify-between text-xs font-bold text-ink-muted tracking-wider uppercase mb-3">
              <span>DETAIL BARANG</span>
              <button @click="selectedProduct = null" class="hover:text-ink">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Big Image Preview -->
            <div class="aspect-4/3 w-full bg-surface-muted rounded-xs overflow-hidden mb-3 relative">
              <img
                :src="selectedProduct.image"
                :alt="selectedProduct.title"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Indicator -->
            <div class="flex items-center justify-between text-xs text-ink-muted mb-3">
              <span>Foto 1 dari 3 · ‹ ›</span>
              <span
                class="px-2 py-0.5 rounded-xs font-bold text-[10px]"
                :class="selectedProduct.status === 'Tersedia' ? 'bg-badge-foundBg text-badge-foundText' : 'bg-surface-muted text-ink-muted'"
              >
                {{ selectedProduct.status }}
              </span>
            </div>

            <!-- Title in Serif -->
            <h2 class="font-serif text-xl sm:text-2xl text-ink font-normal leading-snug mb-1">
              {{ selectedProduct.title }}
            </h2>

            <!-- Price -->
            <div class="text-xl font-bold text-ink mb-1">
              {{ formatRupiah(selectedProduct.price) }}
            </div>

            <div class="text-xs text-ink-muted mb-4">
              {{ selectedProduct.negotiable }} · {{ selectedProduct.condition }}
            </div>

            <hr class="border-border mb-4" />

            <!-- Description -->
            <p class="text-xs text-ink leading-relaxed mb-4">
              {{ selectedProduct.description }}
            </p>

            <!-- Metadata List -->
            <div class="space-y-1 text-xs text-ink-muted border-t border-border pt-3 mb-5">
              <div>Lokasi temu: {{ selectedProduct.location }}</div>
              <div>Diunggah 12 Okt 2026 · {{ selectedProduct.category }}</div>
              <div>Penjual: pemilik barang</div>
            </div>

            <!-- WhatsApp Chat Button (Sesuai Figma) -->
            <a
              :href="`https://wa.me/${selectedProduct.sellerWa}?text=Halo,%20saya%20tertarik%20dengan%20barang%20'${encodeURIComponent(selectedProduct.title)}'%20di%20Menfessin%20Aja.`"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-xs font-semibold py-3 px-4 rounded-sm flex items-center justify-center gap-2 shadow-xs transition-all mb-4"
            >
              <span>Hubungi penjual via WhatsApp</span>
              <span class="text-xs">↗</span>
            </a>

            <!-- Sepakati Langsung Box (Sesuai Figma) -->
            <div class="p-3.5 bg-primary-soft text-xs text-ink leading-relaxed rounded-xs mb-4">
              <span class="font-bold text-primary block mb-0.5">Sepakati langsung dengan penjual.</span>
              Pembayaran barang dan ambil barang diatur lewat WhatsApp. Menfessin Aja tidak menyediakan checkout, escrow, atau pengiriman. Pilih tempat temu yang aman.
            </div>

            <button class="text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors">
              <Flag class="w-3.5 h-3.5" />
              <span>Laporkan listing ini</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Promotional Banner for Seller (Sesuai Figma 07) -->
      <div class="mt-8 p-5 bg-surface border border-border rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-0.5">
            LISTINGMU / LAMPU MEJA BELAJAR
          </div>
          <div class="text-xs text-ink">
            Ingin lebih terlihat? Boost listing via QRIS Midtrans, hanya untuk biaya promosi. Contoh Rp3.000.
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button class="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-sm transition-all flex items-center gap-1">
            <span>Boost listing</span>
            <span class="text-[10px]">↗</span>
          </button>
          <button class="px-4 py-2 bg-surface border border-border text-ink hover:bg-surface-muted text-xs font-semibold rounded-sm transition-colors">
            Tandai terjual
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
