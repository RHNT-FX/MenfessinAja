<script setup lang="ts">
import CategoryNav from '@/components/layout/CategoryNav.vue';
import { CheckCircle2, Clock, MapPin, Plus, Search } from 'lucide-vue-next';
import { ref } from 'vue';

const activeFilter = ref<'all' | 'hilang' | 'ditemukan'>('all');
const searchQuery = ref('');

// Demo Items Lost & Found sesuai SDD 3.6 & SRS FR-001
const demoReports = ref([
  {
    id: 'lf-1',
    tipe: 'ditemukan' as const,
    title: 'Kunci Motor Honda dengan Gantungan Karakter Totoro',
    desc: 'Ditemukan di bangku panjang lantai 2 Gedung Kuliah Bersama (GKB). Bagi yang merasa kehilangan bisa hubungi saya.',
    lokasi: 'Gedung Kuliah Bersama Lt. 2',
    waktu: '1 jam yang lalu',
    status: 'active'
  },
  {
    id: 'lf-2',
    tipe: 'hilang' as const,
    title: 'Kartu Tanda Mahasiswa (KTM) a.n. Muhammad Rayhant',
    desc: 'Tercecer sekitar kantin teknik atau perpustakaan pusat siang tadi. Sangat dibutuhkan untuk presensi ujian.',
    lokasi: 'Sekitar Kantin Teknik',
    waktu: '3 jam yang lalu',
    status: 'active'
  }
]);
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
          placeholder="Cari barang hilang atau ditemukan..." 
          class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-surface-border text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      <button class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all">
        <Plus class="w-4 h-4" />
        <span>Buat Laporan</span>
      </button>
    </div>

    <!-- Filter Buttons -->
    <div class="flex items-center gap-2">
      <button 
        @click="activeFilter = 'all'"
        class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
        :class="activeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-surface text-slate-600 hover:bg-slate-100 border border-surface-border'"
      >
        Semua
      </button>
      <button 
        @click="activeFilter = 'hilang'"
        class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
        :class="activeFilter === 'hilang' ? 'bg-red-600 text-white' : 'bg-surface text-slate-600 hover:bg-slate-100 border border-surface-border'"
      >
        Barang Hilang
      </button>
      <button 
        @click="activeFilter = 'ditemukan'"
        class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
        :class="activeFilter === 'ditemukan' ? 'bg-emerald-600 text-white' : 'bg-surface text-slate-600 hover:bg-slate-100 border border-surface-border'"
      >
        Barang Ditemukan
      </button>
    </div>

    <!-- Reports List -->
    <div class="space-y-4">
      <div 
        v-for="item in demoReports" 
        :key="item.id"
        class="p-5 rounded-2xl bg-surface border border-surface-border shadow-sm hover:border-slate-300 transition-all flex flex-col gap-3"
      >
        <div class="flex items-center justify-between">
          <span 
            class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
            :class="item.tipe === 'hilang' ? 'bg-badge-lost text-badge-lostText' : 'bg-badge-found text-badge-foundText'"
          >
            {{ item.tipe }}
          </span>
          <div class="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock class="w-3.5 h-3.5" />
            <span>{{ item.waktu }}</span>
          </div>
        </div>

        <div>
          <h3 class="font-bold text-slate-900 text-base mb-1">{{ item.title }}</h3>
          <p class="text-slate-600 text-sm leading-relaxed">{{ item.desc }}</p>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-surface-border/60 text-xs">
          <div class="flex items-center gap-1.5 text-slate-500 font-medium">
            <MapPin class="w-4 h-4 text-slate-400" />
            <span>{{ item.lokasi }}</span>
          </div>

          <button class="flex items-center gap-1 text-primary font-semibold hover:underline">
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Tandai Selesai</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
