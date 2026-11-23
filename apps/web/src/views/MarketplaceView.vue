<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import { useAuthStore } from '@/stores/auth';
import { apiFetch } from '@/utils/api';
import { compressImageToWebp } from '@/utils/imageCompressor';
import {
  ArrowRight,
  Flag,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Sparkles,
  X
} from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface MarketplaceItem {
  id: string;
  title: string;
  shortTitle: string;
  price: number;
  category: string;
  condition: string;
  negotiable?: string;
  location: string;
  is_boosted: boolean;
  status: string;
  image: string;
  description: string;
  sellerWa: string;
}

const router = useRouter();
const authStore = useAuthStore();

const searchQuery = ref('');
const activeCategory = ref('Semua');
const selectedProduct = ref<MarketplaceItem | null>(null);
const products = ref<MarketplaceItem[]>([]);
const isLoading = ref(false);
const errorMsg = ref('');

// Modal Pasang Iklan
const isCreateOpen = ref(false);
const isSubmitting = ref(false);
const formTitle = ref('');
const formPrice = ref<number | ''>('');
const formCondition = ref<'bekas' | 'baru'>('bekas');
const formCategory = ref('Elektronik');
const formLocation = ref('');
const formWa = ref('');
const formDesc = ref('');
const isBoostedSelected = ref(false);

// WebP image compression state
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

onMounted(() => {
  loadMarketplace();
});

async function loadMarketplace() {
  isLoading.value = true;
  errorMsg.value = '';
  try {
    const res = await apiFetch('/api/posts', {
      params: { kategori: 'marketplace' }
    });
    if (res.success && res.data?.items) {
      products.value = res.data.items.map((item: any) => ({
        id: item.id,
        title: item.extra_meta?.judul || 'Barang Kampus',
        shortTitle: item.extra_meta?.judul || 'Barang Kampus',
        price: item.extra_meta?.harga || 0,
        category: item.extra_meta?.kategori_barang || 'Umum',
        condition: item.extra_meta?.kondisi === 'baru' ? 'Baru' : 'Bekas, kondisi baik',
        negotiable: 'Bisa nego wajar',
        location: item.extra_meta?.lokasi || 'Sekitar kampus',
        is_boosted: item.is_boosted,
        status: item.extra_meta?.status_barang || (item.status === 'resolved' ? 'Terjual' : 'Tersedia'),
        image: item.media_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
        description: item.teks_konten,
        sellerWa: item.extra_meta?.whatsapp || '081234567890'
      }));
      if (products.value.length > 0 && !selectedProduct.value) {
        selectedProduct.value = products.value[0];
      }
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal memuat barang marketplace';
  } finally {
    isLoading.value = false;
  }
}

function handleOpenCreate() {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  isCreateOpen.value = true;
}

async function handleCreateProduct() {
  if (!formTitle.value || !formPrice.value || !formDesc.value || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const res = await apiFetch('/api/posts/marketplace', {
      method: 'POST',
      body: JSON.stringify({
        judul: formTitle.value,
        harga: Number(formPrice.value),
        kondisi: formCondition.value,
        whatsapp: formWa.value || '081234567890',
        lokasi: formLocation.value || 'Sekitar kampus',
        deskripsi: formDesc.value,
        media_url: imagePreview.value || undefined,
        is_boosted: isBoostedSelected.value
      })
    });

    if (res.success && res.data) {
      const newItem: MarketplaceItem = {
        id: res.data.id,
        title: res.data.extra_meta?.judul || formTitle.value,
        shortTitle: res.data.extra_meta?.judul || formTitle.value,
        price: res.data.extra_meta?.harga || Number(formPrice.value),
        category: formCategory.value,
        condition: formCondition.value === 'baru' ? 'Baru' : 'Bekas, kondisi baik',
        negotiable: 'Bisa nego wajar',
        location: formLocation.value || 'Sekitar kampus',
        is_boosted: res.data.is_boosted,
        status: 'Tersedia',
        image: res.data.media_url || imagePreview.value || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
        description: res.data.teks_konten,
        sellerWa: formWa.value || '081234567890'
      };
      products.value.unshift(newItem);
      selectedProduct.value = newItem;
      isCreateOpen.value = false;
      // Reset form
      formTitle.value = '';
      formPrice.value = '';
      formDesc.value = '';
      formLocation.value = '';
      formWa.value = '';
      removeImage();
    }
  } catch (err: any) {
    alert(err.message || 'Gagal memasang barang');
  } finally {
    isSubmitting.value = false;
  }
}

async function handleMarkSold(prod: MarketplaceItem) {
  try {
    const res = await apiFetch(`/api/posts/${prod.id}/resolve`, {
      method: 'PUT'
    });
    if (res.success) {
      prod.status = 'Terjual';
    }
  } catch (err: any) {
    alert(err.message || 'Gagal memperbarui status');
  }
}

const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchCat = activeCategory.value === 'Semua' || p.category === activeCategory.value;
    const matchSearch =
      !searchQuery.value ||
      p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.value.toLowerCase());
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
      <!-- Header Section (Sesuai Figma 07_Marketplace_Desktop.png) -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div class="text-[11px] font-semibold text-ink-muted tracking-wider uppercase mb-1">
            PASAR KAMPUS / JUAL-BELI LOKAL
          </div>
          <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight">
            Oper barang, hemat uang.
          </h1>
          <p class="text-xs sm:text-sm text-ink-muted mt-1.5">
            Buku bekas, perlengkapan kos, dan barang yang masih layak pakai. Ketemuan langsung di kampus.
          </p>
        </div>

        <button
          @click="handleOpenCreate"
          class="bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
        >
          <Plus class="w-4 h-4" />
          <span>Pasang Iklan</span>
        </button>
      </div>

      <!-- Search & Category Filters (Sesuai Figma) -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-sm">
          <Search class="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari buku, lampu meja, kipas..."
            class="w-full pl-10 pr-4 py-2 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink placeholder:text-ink-muted/80"
          />
        </div>

        <!-- Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            v-for="cat in ['Semua', 'Elektronik', 'Perlengkapan kos', 'Buku']"
            :key="cat"
            @click="activeCategory = cat"
            class="px-3 py-1.5 rounded-sm font-medium transition-colors whitespace-nowrap"
            :class="activeCategory === cat ? 'bg-ink text-white' : 'bg-surface border border-border text-ink hover:bg-surface-muted'"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="p-12 text-center text-ink-muted text-xs flex flex-col items-center gap-2">
        <Loader2 class="w-5 h-5 animate-spin text-primary" />
        <span>Memuat etalase pasar kampus...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMsg" class="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm mb-4">
        {{ errorMsg }}
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProducts.length === 0" class="p-12 text-center bg-surface border border-dashed border-border rounded-sm text-xs text-ink-muted">
        <p class="font-medium text-ink mb-1">Belum ada barang di etalase marketplace.</p>
        <p class="mb-4">Jadilah yang pertama menjual barang bekas atau perlengkapan kos di kampus!</p>
        <button
          @click="handleOpenCreate"
          class="bg-primary text-white px-4 py-2 rounded-sm font-semibold hover:bg-primary-hover transition-colors inline-flex items-center gap-1.5"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Pasang Iklan Sekarang</span>
        </button>
      </div>

      <!-- 2-Column Layout: Grid Katalog & Sticky Product Detail (Sesuai Figma) -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Left: Product Grid Cards (Sesuai Figma) -->
        <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="prod in filteredProducts"
            :key="prod.id"
            @click="selectedProduct = prod"
            class="bg-surface border p-3 rounded-sm cursor-pointer transition-all hover:border-ink/40 group flex flex-col justify-between"
            :class="[
              selectedProduct?.id === prod.id ? 'border-primary ring-1 ring-primary' : 'border-border',
              prod.is_boosted ? 'bg-primary-soft/30' : ''
            ]"
          >
            <div>
              <!-- Product Image Container -->
              <div class="w-full h-40 bg-canvas rounded-xs overflow-hidden mb-3 relative border border-border/40">
                <img
                  :src="prod.image"
                  :alt="prod.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <!-- Boosted Badge -->
                <span
                  v-if="prod.is_boosted"
                  class="absolute top-2 left-2 px-1.5 py-0.5 bg-primary text-white text-[9px] font-bold uppercase rounded-xs tracking-wider"
                >
                  BOOSTED
                </span>
                <!-- Status Badge -->
                <span
                  class="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-xs backdrop-blur-md"
                  :class="prod.status === 'Terjual' ? 'bg-ink/80 text-white' : 'bg-surface/90 text-ink border border-border'"
                >
                  {{ prod.status }}
                </span>
              </div>

              <!-- Price & Category -->
              <div class="flex items-baseline justify-between gap-2 mb-1">
                <span class="font-bold text-ink text-sm sm:text-base">
                  {{ formatRupiah(prod.price) }}
                </span>
                <span class="text-[10px] text-ink-muted">
                  {{ prod.condition }}
                </span>
              </div>

              <!-- Title -->
              <h3 class="text-xs font-semibold text-ink group-hover:text-primary transition-colors line-clamp-1 mb-1">
                {{ prod.shortTitle }}
              </h3>

              <!-- Location & Nego -->
              <div class="text-[11px] text-ink-muted flex items-center justify-between">
                <span>{{ prod.location }}</span>
                <span>{{ prod.negotiable }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Sticky Product Detail Card (Sesuai Figma 07) -->
        <div v-if="selectedProduct" class="lg:col-span-5 bg-surface border border-border p-6 rounded-sm sticky top-24 shadow-xs">
          <div>
            <!-- Header Detail -->
            <div class="flex items-center justify-between text-[11px] text-ink-muted mb-2">
              <span class="font-bold uppercase tracking-wider text-primary">DETAIL BARANG</span>
              <span class="px-2 py-0.5 rounded-xs text-[10px] font-semibold" :class="selectedProduct.status === 'Terjual' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'">
                {{ selectedProduct.status }}
              </span>
            </div>

            <!-- Big Image Preview -->
            <div class="w-full h-52 bg-canvas rounded-xs overflow-hidden mb-4 border border-border">
              <img
                :src="selectedProduct.image"
                :alt="selectedProduct.title"
                class="w-full h-full object-cover"
              />
            </div>

            <h2 class="font-serif text-xl text-ink font-normal mb-1">
              {{ selectedProduct.title }}
            </h2>
            <div class="text-2xl font-bold text-ink mb-4">
              {{ formatRupiah(selectedProduct.price) }}
            </div>

            <!-- Meta details row -->
            <div class="grid grid-cols-2 gap-2 text-xs border-t border-b border-border py-3 mb-4">
              <div>
                <span class="text-[10px] text-ink-muted block">Kondisi</span>
                <span class="font-medium text-ink">{{ selectedProduct.condition }}</span>
              </div>
              <div>
                <span class="text-[10px] text-ink-muted block">Lokasi temu</span>
                <span class="font-medium text-ink">{{ selectedProduct.location }}</span>
              </div>
            </div>

            <!-- Description -->
            <div class="text-xs text-ink leading-relaxed mb-6 whitespace-pre-line">
              <span class="font-bold block mb-1 text-[11px] uppercase tracking-wider text-ink-muted">Catatan Penjual</span>
              {{ selectedProduct.description }}
            </div>

            <!-- WhatsApp Chat Button (Sesuai Figma) -->
            <a
              :href="`https://wa.me/${selectedProduct.sellerWa}?text=Halo,%20saya%20tertarik%20dengan%20barang%20'${encodeURIComponent(selectedProduct.title)}'%20di%20Menfessin%20Aja.`"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-xs font-semibold py-3 px-4 rounded-sm flex items-center justify-center gap-2 shadow-xs transition-all mb-3"
            >
              <span>Hubungi penjual via WhatsApp</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </a>

            <!-- Sepakati Langsung Box (Sesuai Figma) -->
            <div class="p-3 bg-primary-soft text-xs text-ink leading-relaxed rounded-xs mb-3">
              <span class="font-bold text-primary block mb-0.5">Sepakati langsung dengan penjual.</span>
              Pembayaran dan ambil barang diatur lewat WhatsApp. Menfessin Aja tidak menyediakan checkout atau pengiriman.
            </div>

            <div class="flex items-center justify-between text-xs">
              <button
                v-if="selectedProduct.status !== 'Terjual'"
                @click="handleMarkSold(selectedProduct)"
                class="text-xs text-ink-muted hover:text-ink underline cursor-pointer"
              >
                Tandai sudah terjual
              </button>
              <button class="text-xs text-ink-muted hover:text-ink flex items-center gap-1">
                <Flag class="w-3 h-3" />
                <span>Laporkan listing</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PASANG IKLAN MODAL -->
    <div
      v-if="isCreateOpen"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-canvas border border-border w-full max-w-lg p-6 sm:p-8 rounded-sm shadow-2xl relative my-8">
        <button
          @click="isCreateOpen = false"
          class="absolute top-5 right-5 text-ink-muted hover:text-ink p-1 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="mb-4">
          <div class="text-[10px] font-bold text-ink-muted uppercase tracking-wider">PASAR KAMPUS</div>
          <h2 class="font-serif text-2xl text-ink font-normal mt-0.5">Pasang Iklan Barang</h2>
        </div>

        <form @submit.prevent="handleCreateProduct" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-ink mb-1">Nama / Judul Barang *</label>
            <input
              v-model="formTitle"
              type="text"
              required
              placeholder="Contoh: Lampu meja belajar atau Kalkulator TI-84"
              class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-ink mb-1">Harga (Rp) *</label>
              <input
                v-model="formPrice"
                type="number"
                required
                placeholder="50000"
                class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink"
              />
            </div>
            <div>
              <label class="block font-semibold text-ink mb-1">Kondisi</label>
              <select
                v-model="formCondition"
                class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink"
              >
                <option value="bekas">Bekas (Layak)</option>
                <option value="baru">Baru</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-ink mb-1">No WhatsApp Penjual *</label>
              <input
                v-model="formWa"
                type="text"
                placeholder="081234567890"
                class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink font-mono"
              />
            </div>
            <div>
              <label class="block font-semibold text-ink mb-1">Lokasi Temu</label>
              <input
                v-model="formLocation"
                type="text"
                placeholder="Kantin atau Gerbang Utama"
                class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-ink mb-1">Deskripsi / Catatan Barang *</label>
            <textarea
              v-model="formDesc"
              rows="3"
              required
              placeholder="Jelaskan kondisi barang, kelengkapan, alasan dijual..."
              class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink"
            ></textarea>
          </div>

          <!-- WebP Image Upload Section (SRS 1.3.3 & NFR-001) -->
          <div>
            <label class="block font-semibold text-ink mb-1">Foto Barang (Opsional)</label>
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

            <div v-else>
              <label class="cursor-pointer border border-dashed border-border hover:border-ink/50 rounded-sm p-4 text-center block transition-colors bg-surface">
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileSelect"
                />
                <div class="flex flex-col items-center gap-1 text-ink-muted">
                  <Loader2 v-if="isCompressing" class="w-5 h-5 animate-spin text-primary" />
                  <ImageIcon v-else class="w-5 h-5 text-ink-muted" />
                  <span class="font-semibold text-ink text-xs">
                    {{ isCompressing ? 'Mengompresi ke WebP...' : 'Pilih Foto dari Perangkat' }}
                  </span>
                  <span class="text-[10px]">Otomatis dikonversi ke WebP &lt; 100 KB</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Boost Listing Checkbox -->
          <label class="flex items-start gap-2.5 p-3 bg-primary-soft border border-primary/20 rounded-sm cursor-pointer">
            <input v-model="isBoostedSelected" type="checkbox" class="accent-primary mt-0.5" />
            <div class="text-xs">
              <span class="font-bold text-primary flex items-center gap-1">
                <Sparkles class="w-3.5 h-3.5" />
                Sematkan dengan Boost Listing
              </span>
              <span class="text-ink-muted text-[11px] block mt-0.5">Tampil di urutan teratas katalog marketplace.</span>
            </div>
          </label>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
              <span>Pasang Sekarang</span>
            </button>
            <button
              type="button"
              @click="isCreateOpen = false"
              class="bg-surface border border-border text-ink px-4 py-2.5 rounded-sm hover:bg-surface-muted transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
