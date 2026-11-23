<script setup lang="ts">
import TurnstileWidget from '@/components/common/TurnstileWidget.vue';
import { useAuthStore } from '@/stores/auth';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck
} from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// Login state
const email = ref('student@menfessinaja.ac.id');
const password = ref('password123');
const showPassword = ref(false);
const rememberMe = ref(true);
const turnstileToken = ref('demo-turnstile-token');
const isSubmitting = ref(false);
const loginError = ref('');

// Validation errors
const emailError = computed(() => {
  if (!email.value) return 'Email wajib diisi';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) return 'Format email tidak valid (harus mengandung @ dan domain)';
  return '';
});

const passwordError = computed(() => {
  if (!password.value) return 'Kata sandi wajib diisi';
  if (password.value.length < 6) return 'Kata sandi minimal 6 karakter';
  return '';
});

const isFormValid = computed(() => {
  return !emailError.value && !passwordError.value && Boolean(turnstileToken.value);
});

async function handleLogin() {
  if (emailError.value) {
    loginError.value = emailError.value;
    return;
  }
  if (passwordError.value) {
    loginError.value = passwordError.value;
    return;
  }
  if (!turnstileToken.value) {
    loginError.value = 'Silakan selesaikan verifikasi Cloudflare Turnstile terlebih dahulu';
    return;
  }
  loginError.value = '';
  isSubmitting.value = true;

  try {
    const user = await authStore.login(email.value, password.value, turnstileToken.value);
    if (user?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  } catch (err: any) {
    loginError.value = err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.';
  } finally {
    isSubmitting.value = false;
  }
}

function setPreset(type: 'member' | 'admin') {
  if (type === 'member') {
    email.value = 'student@menfessinaja.ac.id';
    password.value = 'password123';
  } else {
    email.value = 'admin@menfessinaja.ac.id';
    password.value = 'password123';
  }
  loginError.value = '';
}
</script>

<template>
  <div class="py-4 sm:py-8 max-w-5xl mx-auto px-4">
    <!-- Back to Feed Link -->
    <div class="mb-6">
      <router-link
        to="/"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke linimasa utama</span>
      </router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Branding / Philosophy (Sesuai Figma GUEH) -->
      <div class="lg:col-span-5 space-y-6">
        <div>
          <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight mb-3">
            Satu akun.<br />Tetap anonim.
          </h1>
          <p class="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Akun digunakan untuk menjaga ruang ini tetap aman dan tertib, bukan untuk memajang identitasmu.
          </p>
        </div>

        <!-- Quote Box Editorial Style -->
        <div class="p-5 bg-surface border-l-4 border-primary text-ink text-xs sm:text-sm leading-relaxed rounded-r-sm space-y-2.5 shadow-xs">
          <p class="font-serif italic text-ink">
            "Di sini, ceritamu yang dikenal. Bukan namamu."
          </p>
          <p class="text-[11px] text-ink-muted">
            Identitas asli tidak tampil di feed publik. Tim moderator hanya meninjau akun jika melanggar pedoman komunitas.
          </p>
        </div>

        <!-- Demo Account Presets -->
        <div class="p-4 bg-surface border border-border rounded-sm space-y-2.5 text-xs">
          <span class="font-bold text-ink-muted text-[11px] uppercase tracking-wider block">
            Kredensial Demo Cepat:
          </span>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="setPreset('member')"
              class="px-2.5 py-2 border rounded-xs text-left transition-all hover:border-primary active:scale-98"
              :class="email.includes('student') ? 'bg-primary-soft border-primary text-primary font-bold' : 'bg-canvas border-border text-ink'"
            >
              <div class="font-bold text-[11px] flex items-center gap-1">
                <UserCheck class="w-3 h-3 text-primary" />
                <span>Akun Member</span>
              </div>
              <div class="text-[10px] text-ink-muted truncate">student@...</div>
            </button>

            <button
              type="button"
              @click="setPreset('admin')"
              class="px-2.5 py-2 border rounded-xs text-left transition-all hover:border-primary active:scale-98"
              :class="email.includes('admin') ? 'bg-primary-soft border-primary text-primary font-bold' : 'bg-canvas border-border text-ink'"
            >
              <div class="font-bold text-[11px] flex items-center gap-1">
                <ShieldCheck class="w-3 h-3 text-primary" />
                <span>Akun Admin</span>
              </div>
              <div class="text-[10px] text-ink-muted truncate">admin@...</div>
            </button>
          </div>
          <p class="text-[10px] text-ink-muted">Kata sandi: <span class="font-mono font-bold">password123</span></p>
        </div>
      </div>

      <!-- Right Column: Dedicated Login Form Card -->
      <div class="lg:col-span-7 bg-surface border border-border p-6 sm:p-8 rounded-sm shadow-xs space-y-5">
        <div>
          <div class="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
            Autentikasi Pengguna
          </div>
          <h2 class="font-serif text-2xl text-ink font-normal">
            Masuk ke Akun
          </h2>
          <p class="text-xs text-ink-muted mt-1">
            Silakan masukkan kredensial kampusmu untuk melanjutkan obrolan.
          </p>
        </div>

        <!-- Alert Error Banner -->
        <div v-if="loginError" class="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-start gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{{ loginError }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4 text-xs">
          <!-- Email Input -->
          <div>
            <label class="block font-semibold text-ink mb-1">
              Alamat Email Kampus / Pribadi *
            </label>
            <div class="relative">
              <Mail class="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
              <input
                v-model="email"
                type="email"
                required
                placeholder="nama@kampus.ac.id"
                class="w-full pl-9 pr-3 py-2.5 bg-canvas border rounded-sm focus:outline-none transition-colors"
                :class="email && emailError ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
              />
            </div>
            <p v-if="email && emailError" class="text-[11px] text-red-600 mt-1">
              {{ emailError }}
            </p>
          </div>

          <!-- Password Input -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-semibold text-ink">Kata Sandi *</label>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                <EyeOff v-if="showPassword" class="w-3.5 h-3.5" />
                <Eye v-else class="w-3.5 h-3.5" />
                <span>{{ showPassword ? 'Sembunyikan' : 'Lihat' }}</span>
              </button>
            </div>
            <div class="relative">
              <Lock class="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Minimal 6 karakter"
                class="w-full pl-9 pr-3 py-2.5 bg-canvas border rounded-sm focus:outline-none transition-colors"
                :class="password && passwordError ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
              />
            </div>
            <p v-if="password && passwordError" class="text-[11px] text-red-600 mt-1">
              {{ passwordError }}
            </p>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center justify-between text-xs pt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none text-ink">
              <input v-model="rememberMe" type="checkbox" class="accent-primary rounded-xs" />
              <span>Ingat saya di perangkat ini</span>
            </label>
            <router-link to="/bantuan" class="text-ink-muted hover:text-primary transition-colors text-[11px]">
              Lupa kata sandi?
            </router-link>
          </div>

          <!-- Cloudflare Turnstile Human-Check -->
          <div class="pt-2">
            <label class="block font-semibold text-ink mb-1.5 text-[11px]">
              Verifikasi Keamanan Manusia (Anti-Bot Cloudflare)
            </label>
            <TurnstileWidget v-model="turnstileToken" />
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="!isFormValid || isSubmitting"
              class="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-xs font-semibold py-3 px-4 rounded-sm transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{{ isSubmitting ? 'Memproses Masuk...' : 'Masuk ke Akun' }}</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <!-- Switch to Register Screen Banner -->
        <div class="border-t border-border pt-4 text-center text-xs text-ink-muted space-y-2">
          <p>
            Belum memiliki akun di Menfessin Aja?
          </p>
          <router-link
            to="/register"
            class="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
          >
            <span>Daftar akun baru di sini</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
