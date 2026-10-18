<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { LogIn, LogOut, MessageSquarePlus, Shield, User as UserIcon } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.logout();
  router.push('/');
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-border">
    <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <!-- Brand Logo -->
      <router-link to="/" class="flex items-center gap-2 group">
        <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
          <MessageSquarePlus class="w-5 h-5" />
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg leading-tight text-slate-900 tracking-tight">Menfessin Aja</span>
          <span class="text-xs text-slate-500 font-medium">Campus Community</span>
        </div>
      </router-link>

      <!-- Right Action Items -->
      <div class="flex items-center gap-3">
        <template v-if="authStore.isAuthenticated">
          <!-- Admin Dashboard Link -->
          <router-link 
            v-if="authStore.isAdmin"
            to="/admin" 
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200"
          >
            <Shield class="w-3.5 h-3.5" />
            <span>Moderasi Admin</span>
          </router-link>

          <!-- User Info & Logout -->
          <div class="flex items-center gap-2 pl-2 border-l border-surface-border">
            <div class="hidden sm:flex flex-col items-end">
              <span class="text-xs font-semibold text-slate-800">{{ authStore.user?.email.split('@')[0] }}</span>
              <span class="text-[10px] text-slate-500 capitalize">{{ authStore.user?.role }}</span>
            </div>
            <button 
              @click="handleLogout"
              title="Keluar"
              class="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        </template>

        <template v-else>
          <router-link 
            to="/login"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <LogIn class="w-4 h-4" />
            <span>Masuk</span>
          </router-link>

          <router-link 
            to="/register"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm transition-colors"
          >
            <UserIcon class="w-4 h-4" />
            <span>Daftar</span>
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>
