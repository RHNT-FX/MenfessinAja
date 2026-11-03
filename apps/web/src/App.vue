<script setup lang="ts">
import AppNavbar from '@/components/layout/AppNavbar.vue';
import { useAuthStore } from '@/stores/auth';
import { onMounted } from 'vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initFromStorage();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-canvas text-ink font-sans selection:bg-blue-100 selection:text-blue-900">
    <!-- Navbar Header -->
    <AppNavbar />

    <!-- Main Content Area -->
    <main class="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <router-view />
    </main>

    <!-- Footer (Sesuai Figma) -->
    <footer class="border-t border-border bg-canvas py-8 text-xs text-ink-muted">
      <div class="max-w-[1360px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="font-medium">GUEH / Menfessin aja. © 2026</p>
        <div class="flex items-center gap-4 text-ink-muted">
          <a href="#privasi" class="hover:text-ink transition-colors">Privasi</a>
          <span>/</span>
          <a href="#pedoman" class="hover:text-ink transition-colors">Pedoman</a>
          <span>/</span>
          <a href="#bantuan" class="hover:text-ink transition-colors">Bantuan</a>
        </div>
      </div>
    </footer>
  </div>
</template>
