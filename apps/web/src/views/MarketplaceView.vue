<script setup lang="ts">
import CategoryNav from '@/components/layout/CategoryNav.vue';
import { ExternalLink, Plus, Search, Sparkles } from 'lucide-vue-next';
import { ref } from 'vue';

const searchQuery = ref('');

// Demo Items Marketplace sesuai SDD 3.6 & SRS FR-001
const demoProducts = ref([
  {
    id: 'prod-1',
    title: 'Buku Kalkulus Purcell Edisi 9',
    price: 85000,
    condition: 'Bekas (Mulus)',
    is_boosted: true,
    seller_wa: '6281234567890',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    date: 'Hari ini'
  },
  {
    id: 'prod-2',
    title: 'Keyboard Mechanical 60% Red Switch',
    price: 250000,
    condition: 'Bekas',
    is_boosted: false,
    seller_wa: '6289876543210',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
    date: 'Kemarin'
  }
]);

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}
</script>

<template>
  <div class="space-y-6">
    <CategoryNav />

    <!-- Action & Search -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Cari barang di marketplace kampus..." 
          class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-surface-border text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      <button class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all">
        <Plus class="w-4 h-4" />
        <span>Jual Barang</span>
      </button>
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      <div 
        v-for="item in demoProducts" 
        :key="item.id"
        class="bg-surface rounded-2xl border border-surface-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
        :class="{ 'ring-2 ring-purple-400/60': item.is_boosted }"
      >
        <!-- Product Image -->
        <div class="relative aspect-video sm:aspect-square bg-slate-100 overflow-hidden">
          <img :src="item.image" :alt="item.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <span 
            v-if="item.is_boosted" 
            class="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600 text-white shadow-sm"
          >
            <Sparkles class="w-3 h-3" />
            BOOSTED
          </span>
          <span class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-black/60 text-white backdrop-blur-sm">
            {{ item.condition }}
          </span>
        </div>

        <!-- Info -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-slate-900 line-clamp-2 text-sm sm:text-base leading-snug mb-1">
              {{ item.title }}
            </h3>
            <p class="text-primary font-extrabold text-base sm:text-lg mb-3">
              {{ formatRupiah(item.price) }}
            </p>
          </div>

          <!-- WhatsApp Chat Button (Sesuai SRS 1.3.2 C2C direct to WA) -->
          <a 
            :href="`https://wa.me/${item.seller_wa}?text=Halo,%20saya%20tertarik%20dengan%20barang%20'${encodeURIComponent(item.title)}'%20di%20MenfessinAja`"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Hubungi via WhatsApp</span>
            <ExternalLink class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
