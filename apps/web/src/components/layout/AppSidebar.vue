<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { HelpCircle, MessageSquare, ShoppingBag } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

const route = useRoute();
const authStore = useAuthStore();

const emit = defineEmits<{
  (e: 'open-create'): void;
  (e: 'filter-topic', topic: string): void;
}>();

const topics = [
  'Semua cerita',
  '# curhat',
  '# akademik',
  '# tanya',
  '# apresiasi',
  '# info kampus'
];
</script>

<template>
  <aside class="w-60 shrink-0 hidden lg:flex flex-col gap-6 text-xs text-ink select-none pr-4">
    <!-- SEKITAR KAMU (Sesuai Figma) -->
    <div class="space-y-2.5">
      <div class="text-[11px] font-bold tracking-wider text-ink-muted uppercase">
        SEKITAR KAMU
      </div>
      <div class="space-y-1">
        <router-link
          to="/"
          class="flex items-center gap-3 px-3 py-2 rounded-sm transition-colors"
          :class="route.path === '/' ? 'bg-primary-soft text-primary font-bold' : 'text-ink hover:bg-surface-muted font-medium'"
        >
          <MessageSquare class="w-4 h-4" />
          <span>Menfess</span>
        </router-link>

        <router-link
          to="/marketplace"
          class="flex items-center gap-3 px-3 py-2 rounded-sm transition-colors"
          :class="route.path.startsWith('/marketplace') ? 'bg-primary-soft text-primary font-bold' : 'text-ink hover:bg-surface-muted font-medium'"
        >
          <ShoppingBag class="w-4 h-4" />
          <span>Marketplace</span>
        </router-link>

        <router-link
          to="/lost-found"
          class="flex items-center gap-3 px-3 py-2 rounded-sm transition-colors"
          :class="route.path.startsWith('/lost-found') ? 'bg-primary-soft text-primary font-bold' : 'text-ink hover:bg-surface-muted font-medium'"
        >
          <HelpCircle class="w-4 h-4" />
          <span>Lost & Found</span>
        </router-link>
      </div>
    </div>

    <!-- Tombol Aksi Tulis Menfess (Sesuai Figma) -->
    <div>
      <button
        @click="emit('open-create')"
        class="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-sm transition-all flex items-center justify-center gap-1.5 shadow-sm text-xs"
      >
        <span>+ Tulis Menfess</span>
      </button>
    </div>

    <div class="border-t border-border"></div>

    <!-- JELAJAHI TOPIK (Sesuai Figma) -->
    <div class="space-y-2.5">
      <div class="text-[11px] font-bold tracking-wider text-ink-muted uppercase">
        JELAJAHI TOPIK
      </div>
      <div class="space-y-2 text-xs">
        <button
          v-for="(t, idx) in topics"
          :key="t"
          @click="emit('filter-topic', t)"
          class="block w-full text-left transition-colors font-medium"
          :class="idx === 0 ? 'text-primary font-bold' : 'text-ink-muted hover:text-ink'"
        >
          {{ t }}
        </button>
      </div>
    </div>

    <div class="border-t border-border"></div>

    <!-- Links Bantuan & Info (Sesuai Figma) -->
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

    <!-- Info Privasi (Sesuai Figma) -->
    <div class="text-[11px] text-ink-muted leading-relaxed mt-auto pt-6 border-t border-border">
      <template v-if="authStore.isAuthenticated">
        Kamu masuk. Identitas akun tidak tampil di Menfess.
      </template>
      <template v-else>
        Boleh baca tanpa akun. Masuk untuk menulis, vote, dan membalas.
      </template>
    </div>
  </aside>
</template>
