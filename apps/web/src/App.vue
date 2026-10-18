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
  <div class="min-h-screen flex flex-col bg-canvas text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-700">
    <!-- Navbar Header -->
    <AppNavbar />

    <!-- Main Content Area (Mobile-First responsive container) -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="border-t border-surface-border bg-surface py-6 text-center text-xs text-slate-500">
      <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Menfessin Aja. Hyperlocal Campus Community Platform.</p>
        <p class="text-[11px] text-slate-400">Dibuat sesuai dokumen spesifikasi SRS & SDD (v1.0)</p>
      </div>
    </footer>
  </div>
</template>
