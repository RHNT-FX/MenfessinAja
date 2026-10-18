<script setup lang="ts">
import CategoryNav from '@/components/layout/CategoryNav.vue';
import { Heart, MessageCircle, MessageSquarePlus, Pin, Search, Sparkles } from 'lucide-vue-next';
import { ref } from 'vue';

const searchQuery = ref('');

// Demo Pinned Post (Superchat) sesuai SDD 3.4 & SRS FR-004
const demoPinnedPost = {
  id: 'pinned-1',
  user: 'Anonim (Disematkan)',
  text: '📌 Pengumuman Kampus: Pendaftaran Beasiswa Semester Genap telah dibuka hingga akhir pekan. Harap lengkapi berkas di portal akademik!',
  upvotes: 89,
  comments: 14,
  is_boosted: true,
  time: '2 jam yang lalu'
};

// Demo Menfess Items
const demoPosts = ref([
  {
    id: 'post-1',
    user: 'Anonim #3821',
    text: 'Ada yang punya rekomendasi dosen pembimbing untuk topik Machine Learning & Computer Vision di prodi Informatika? Mohon infonya ya guys!',
    upvotes: 24,
    comments: 5,
    is_boosted: false,
    time: '15 menit yang lalu'
  },
  {
    id: 'post-2',
    user: 'Anonim #1092',
    text: 'Info tempat fotocopy dan print skripsi yang buka 24 jam dekat gerbang utama kampus dong, butuh darurat buat besok pagi 🙏',
    upvotes: 11,
    comments: 2,
    is_boosted: false,
    time: '45 menit yang lalu'
  }
]);
</script>

<template>
  <div class="space-y-6">
    <!-- Category Tabs Navigation -->
    <CategoryNav />

    <!-- Top Action & Search Bar (Sesuai Desain Figma) -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Cari pesan di linimasa..." 
          class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-surface-border text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      <!-- Create Post Button -->
      <button 
        class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
      >
        <MessageSquarePlus class="w-4 h-4" />
        <span>Kirim Menfess</span>
      </button>
    </div>

    <!-- Pinned Superchat Post (Sesuai SDD Sequence 4.4 & SRS 2.2) -->
    <div class="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 shadow-sm relative overflow-hidden">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-200 text-amber-900">
            <Pin class="w-3.5 h-3.5" />
            SUPERCHAT PINNED
          </span>
          <span class="text-xs text-amber-800/80 font-medium">{{ demoPinnedPost.time }}</span>
        </div>
        <Sparkles class="w-4 h-4 text-amber-500 animate-pulse" />
      </div>

      <p class="text-slate-800 text-sm sm:text-base leading-relaxed mb-4">
        {{ demoPinnedPost.text }}
      </p>

      <div class="flex items-center gap-4 text-xs font-medium text-amber-900/80">
        <button class="flex items-center gap-1.5 hover:text-amber-950 transition-colors">
          <Heart class="w-4 h-4 text-amber-600 fill-amber-200" />
          <span>{{ demoPinnedPost.upvotes }} Suka</span>
        </button>
        <button class="flex items-center gap-1.5 hover:text-amber-950 transition-colors">
          <MessageCircle class="w-4 h-4 text-amber-600" />
          <span>{{ demoPinnedPost.comments }} Komentar</span>
        </button>
      </div>
    </div>

    <!-- Timeline Posts List -->
    <div class="space-y-4">
      <div 
        v-for="post in demoPosts" 
        :key="post.id"
        class="p-5 rounded-2xl bg-surface border border-surface-border shadow-sm hover:border-slate-300 transition-all"
      >
        <div class="flex items-center justify-between mb-2.5">
          <span class="text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-lg">
            {{ post.user }}
          </span>
          <span class="text-xs text-slate-400">{{ post.time }}</span>
        </div>

        <p class="text-slate-800 text-sm sm:text-base leading-relaxed mb-4">
          {{ post.text }}
        </p>

        <div class="flex items-center justify-between pt-2 border-t border-surface-border/60">
          <div class="flex items-center gap-4 text-xs font-medium text-slate-500">
            <button class="flex items-center gap-1.5 hover:text-red-600 transition-colors group">
              <Heart class="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{{ post.upvotes }}</span>
            </button>
            <button class="flex items-center gap-1.5 hover:text-primary transition-colors group">
              <MessageCircle class="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{{ post.comments }} komentar</span>
            </button>
          </div>

          <button 
            title="Beli Superchat (Sematkan)"
            class="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 hover:underline"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>Boost</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
