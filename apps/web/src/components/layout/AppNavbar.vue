<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { LogOut, Search, ShieldCheck } from 'lucide-vue-next';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const globalSearch = ref('');

function handleLogout() {
  authStore.logout();
  router.push('/');
}
</script>

<template>
  <header class="w-full bg-canvas border-b border-border sticky top-0 z-40">
    <div class="max-w-[1360px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-6">
      <!-- Logo & Brand Header (Sesuai Figma) -->
      <div class="flex items-center gap-4">
        <router-link to="/" class="flex items-baseline gap-3 group">
          <span class="font-black text-3xl sm:text-4xl tracking-tighter text-ink select-none">
            GUEH.
          </span>
          <div class="hidden sm:flex flex-col text-left">
            <span class="text-xs font-bold text-ink leading-tight">Menfessin aja.</span>
            <span class="text-[11px] text-ink-muted leading-tight">Papan cerita & kabar kampus</span>
          </div>
        </router-link>
      </div>

      <!-- Center Search Bar (Sesuai Figma) -->
      <div class="hidden md:flex flex-1 max-w-md">
        <div class="relative w-full">
          <Search class="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="globalSearch"
            type="text"
            placeholder="Cari di sekitar kamu..."
            class="w-full pl-10 pr-4 py-2 bg-surface border border-border text-xs rounded-sm focus:outline-none focus:border-ink placeholder:text-ink-muted/80 transition-colors"
          />
        </div>
      </div>

      <!-- Right Actions (Sesuai Figma) -->
      <div class="flex items-center gap-4 sm:gap-6 text-xs font-medium">
        <a 
          href="#bantuan" 
          class="text-ink hover:underline hidden sm:inline-flex items-center gap-0.5"
        >
          <span>Bantuan</span>
          <span class="text-[10px]">↗</span>
        </a>

        <!-- Authenticated State -->
        <template v-if="authStore.isAuthenticated">
          <!-- Admin Badge -->
          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-canvas rounded-full text-xs font-semibold hover:bg-ink/90 transition-colors"
          >
            <ShieldCheck class="w-3.5 h-3.5 text-blue-300" />
            <span>ADMIN • Sesi aman</span>
          </router-link>

          <!-- Member Pill Badge (Sesuai Figma) -->
          <div v-else class="flex items-center gap-1.5 px-3 py-1 bg-primary-soft text-primary font-semibold rounded-full text-xs">
            <span class="w-2 h-2 rounded-full bg-primary inline-block"></span>
            <span>Anggota</span>
          </div>

          <!-- Logout Button -->
          <button
            @click="handleLogout"
            title="Keluar"
            class="p-1.5 rounded text-ink-muted hover:text-red-700 transition-colors"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </template>

        <!-- Guest / Not Logged In State (Sesuai Figma) -->
        <template v-else>
          <router-link
            to="/login"
            class="px-4 py-2 border border-border bg-surface text-ink font-semibold rounded-sm hover:bg-surface-muted transition-colors flex items-center gap-1"
          >
            <span>Masuk</span>
            <span class="text-[10px]">↗</span>
          </router-link>
        </template>
      </div>
    </div>

    <!-- Mobile Navigation Bar (Sesuai Figma Frame Mobile) -->
    <div class="md:hidden border-t border-border bg-canvas px-4 flex items-center justify-start gap-6 overflow-x-auto text-xs font-semibold">
      <router-link
        to="/"
        class="py-2.5 transition-colors whitespace-nowrap"
        :class="route.path === '/' || route.path.startsWith('/menfess') ? 'text-ink border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
      >
        Menfess
      </router-link>
      <router-link
        to="/marketplace"
        class="py-2.5 transition-colors whitespace-nowrap"
        :class="route.path.startsWith('/marketplace') ? 'text-ink border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
      >
        Marketplace
      </router-link>
      <router-link
        to="/lost-found"
        class="py-2.5 transition-colors whitespace-nowrap"
        :class="route.path.startsWith('/lost-found') ? 'text-ink border-b-2 border-ink' : 'text-ink-muted hover:text-ink'"
      >
        Lost & Found
      </router-link>
    </div>
  </header>
</template>
