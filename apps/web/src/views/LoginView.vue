<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, CheckCircle2, Lock, Mail, ShieldCheck } from 'lucide-vue-next';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const turnstileVerified = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

function handleTurnstileSimulate() {
  // Simulasi verifikasi human-check Turnstile untuk tahap Sprint 0
  turnstileVerified.value = true;
}

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Silakan lengkapi email dan kata sandi';
    return;
  }
  if (!turnstileVerified.value) {
    errorMessage.value = 'Silakan selesaikan tantangan verifikasi anti-bot';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Sprint 0 default mock login (akan dihubungkan ke API di Sprint 1)
    const isAdmin = email.value.includes('admin');
    authStore.setAuth(
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: email.value,
        role: isAdmin ? 'admin' : 'member',
        status: 'active',
        created_at: new Date().toISOString()
      },
      'demo-jwt-token-sprint-0'
    );
    router.push(isAdmin ? '/admin' : '/');
  } catch (err: any) {
    errorMessage.value = err.message || 'Login gagal';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="max-w-md mx-auto py-8 px-4">
    <router-link to="/" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors">
      <ArrowLeft class="w-4 h-4" />
      <span>Kembali ke Beranda</span>
    </router-link>

    <div class="bg-surface p-6 sm:p-8 rounded-3xl border border-surface-border shadow-sm">
      <div class="mb-6 text-center">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Masuk Akun</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Gunakan akun civitas kampus untuk memposting</p>
      </div>

      <div v-if="errorMessage" class="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Email -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">Email Mahasiswa / Admin</label>
          <div class="relative">
            <Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              v-model="email"
              type="email" 
              required
              placeholder="nama@kampus.ac.id" 
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-canvas border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">Kata Sandi</label>
          <div class="relative">
            <Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              v-model="password"
              type="password" 
              required
              placeholder="••••••••" 
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-canvas border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <!-- Cloudflare Turnstile Human Challenge Widget (Sesuai SRS 2.5 & SDD 4.2) -->
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ShieldCheck class="w-5 h-5 text-primary" />
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-slate-800">Verifikasi Anti-Bot</span>
              <span class="text-[10px] text-slate-400">Cloudflare Turnstile</span>
            </div>
          </div>
          <button 
            type="button"
            @click="handleTurnstileSimulate"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            :class="turnstileVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'"
          >
            <span v-if="turnstileVerified" class="flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
              <span>Terverifikasi</span>
            </span>
            <span v-else>Verifikasi</span>
          </button>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <span v-if="isLoading">Memproses...</span>
          <span v-else>Masuk ke Aplikasi</span>
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-surface-border text-center">
        <p class="text-xs text-slate-500">
          Belum punya akun? 
          <router-link to="/register" class="text-primary font-semibold hover:underline">Daftar sekarang</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
