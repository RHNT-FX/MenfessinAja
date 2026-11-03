<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-vue-next';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// Login state
const loginEmail = ref('student@menfessinaja.ac.id');
const loginPassword = ref('password123');
const showLoginPassword = ref(false);
const rememberMe = ref(true);
const loginError = ref('');

// Register state
const regEmail = ref('');
const regPassword = ref('');
const regConfirmPassword = ref('');
const showRegPassword = ref(false);
const agreePolicy = ref(true);
const regError = ref('');
const regSuccess = ref('');

async function handleLogin() {
  if (!loginEmail.value || !loginPassword.value) {
    loginError.value = 'Silakan lengkapi email dan kata sandi';
    return;
  }
  loginError.value = '';

  try {
    const user = await authStore.login(loginEmail.value, loginPassword.value, 'demo-turnstile-token');
    if (user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  } catch (err: any) {
    loginError.value = err.message || 'Login gagal';
  }
}

async function handleRegister() {
  if (!regEmail.value || !regPassword.value || !regConfirmPassword.value) {
    regError.value = 'Semua kolom pendaftaran wajib diisi';
    return;
  }
  if (regPassword.value !== regConfirmPassword.value) {
    regError.value = 'Konfirmasi kata sandi tidak cocok';
    return;
  }
  if (!agreePolicy.value) {
    regError.value = 'Anda harus menyetujui pedoman komunitas';
    return;
  }
  regError.value = '';

  try {
    await authStore.register(regEmail.value, regPassword.value, 'demo-turnstile-token');
    regSuccess.value = 'Akun berhasil dibuat! Mengalihkan ke beranda...';
    setTimeout(() => {
      router.push('/');
    }, 1000);
  } catch (err: any) {
    regError.value = err.message || 'Pendaftaran gagal';
  }
}
</script>

<template>
  <div class="py-4 sm:py-6">
    <!-- Back to Feed Link -->
    <div class="mb-6">
      <router-link
        to="/"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke papan cerita</span>
      </router-link>
    </div>

    <!-- 3-Column Layout (Sesuai Figma 11_Signin_Desktop.png) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- COLUMN 1: Editorial Branding & Values -->
      <div class="lg:col-span-4 space-y-6">
        <div>
          <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight">
            Satu akun.<br />Tetap anonim.
          </h1>
          <p class="text-xs text-ink-muted mt-2 leading-relaxed">
            Akun untuk menjaga ruang ini, bukan untuk memajang identitasmu.
          </p>
        </div>

        <!-- Cobalt Blue Card (Sesuai Figma) -->
        <div class="bg-primary text-white p-6 sm:p-7 rounded-sm space-y-4 shadow-sm">
          <span class="font-serif text-5xl leading-none block select-none opacity-80 font-normal">“</span>
          <h2 class="font-serif text-xl sm:text-2xl font-normal leading-snug">
            Di sini, ceritamu yang dikenal. Bukan namamu.
          </h2>
          <p class="text-xs text-blue-100 leading-relaxed font-light">
            Identitas asli tidak tampil di feed. Namun, admin tetap dapat meninjau dan memblokir akun yang melanggar pedoman. Anonim bukan berarti bebas menyakiti.
          </p>
          <a href="#batas" class="inline-flex items-center gap-1 text-xs font-semibold text-white underline hover:text-blue-100">
            <span>Kenali batasnya</span>
            <span>↗</span>
          </a>
        </div>

        <!-- Quick Demo Hint -->
        <div class="p-3 bg-surface border border-border text-xs text-ink space-y-1.5 rounded-sm">
          <div class="font-bold text-ink-muted text-[11px] uppercase tracking-wider">Kredensial Demo:</div>
          <div class="flex flex-wrap gap-2 text-[11px]">
            <button
              @click="loginEmail = 'student@menfessinaja.ac.id'; loginPassword = 'password123'"
              class="px-2 py-1 bg-canvas hover:bg-surface-muted border border-border rounded-xs font-medium"
            >
              Member: student@...
            </button>
            <button
              @click="loginEmail = 'admin@menfessinaja.ac.id'; loginPassword = 'password123'"
              class="px-2 py-1 bg-canvas hover:bg-surface-muted border border-border rounded-xs font-medium"
            >
              Admin: admin@...
            </button>
          </div>
        </div>

        <div class="text-xs text-ink-muted">
          Kesulitan masuk? <a href="#faq" class="text-ink hover:underline">Bantuan & FAQ ↗</a>
        </div>
      </div>

      <!-- COLUMN 2: Sign In Form (Udah punya akun?) -->
      <div class="lg:col-span-4 bg-canvas space-y-4">
        <div class="border-t-2 border-ink pt-3">
          <h2 class="font-serif text-2xl text-ink font-normal">
            Udah punya akun?
          </h2>
          <p class="text-xs text-ink-muted mt-1">
            Masuk, lalu lanjutkan obrolannya.
          </p>
        </div>

        <div v-if="loginError" class="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm">
          {{ loginError }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-3.5 text-xs">
          <!-- Email Input -->
          <div>
            <label class="block font-semibold text-ink mb-1">Email</label>
            <input
              v-model="loginEmail"
              type="email"
              required
              placeholder="kamu@example.com"
              class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink font-medium"
            />
            <p class="text-[10px] text-ink-muted mt-1">
              Email hanya untuk akun, tidak tampil di Menfess.
            </p>
          </div>

          <!-- Password Input -->
          <div>
            <label class="block font-semibold text-ink mb-1">Kata sandi</label>
            <div class="relative">
              <input
                v-model="loginPassword"
                :type="showLoginPassword ? 'text' : 'password'"
                required
                class="w-full p-2.5 pr-9 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink font-mono"
              />
              <button
                type="button"
                @click="showLoginPassword = !showLoginPassword"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <EyeOff v-if="showLoginPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Remember & Forgot -->
          <div class="flex items-center justify-between text-xs pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-ink select-none">
              <input v-model="rememberMe" type="checkbox" class="accent-primary" />
              <span>Ingat saya</span>
            </label>
            <a href="#lupa" class="text-primary hover:underline text-[11px]">
              Lupa kata sandi?
            </a>
          </div>

          <!-- Cloudflare Turnstile Placeholder (Sesuai Figma) -->
          <div class="p-3 bg-surface border border-border rounded-sm flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-primary" />
              <div>
                <div class="font-semibold text-ink text-[11px]">Verifikasi manusia</div>
                <div class="text-[10px] text-ink-muted">Cloudflare Turnstile · placeholder demo</div>
              </div>
            </div>
            <span class="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5" /> Terverifikasi
            </span>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-sm transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Masuk ke Akun</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>

          <p class="text-[10px] text-ink-muted leading-normal">
            Isi email dan kata sandi, lalu selesaikan verifikasi manusia. Form ini terkoneksi ke backend Hono.
          </p>

          <!-- Guest Callout Box (Sesuai Figma) -->
          <div class="p-3.5 bg-primary-soft text-xs text-ink leading-relaxed rounded-xs border-l-2 border-primary mt-4">
            <span class="font-bold text-primary block mb-0.5">Cuma mau baca? Boleh.</span>
            Feed, komentar, pencarian barang, dan Lost & Found bisa dibaca tanpa masuk.
            <router-link to="/" class="font-semibold text-primary hover:underline block mt-1">
              Lanjut sebagai tamu ↗
            </router-link>
          </div>
        </form>
      </div>

      <!-- COLUMN 3: Register Form (Baru di sini?) -->
      <div class="lg:col-span-4 bg-canvas space-y-4">
        <div class="border-t-2 border-ink pt-3">
          <h2 class="font-serif text-2xl text-ink font-normal">
            Baru di sini?
          </h2>
          <p class="text-xs text-ink-muted mt-1">
            Bikin akun untuk menulis, membalas, dan saling bantu.
          </p>
        </div>

        <div v-if="regError" class="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm">
          {{ regError }}
        </div>
        <div v-if="regSuccess" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm">
          {{ regSuccess }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-3.5 text-xs">
          <!-- Email Input -->
          <div>
            <label class="block font-semibold text-ink mb-1">Email *</label>
            <input
              v-model="regEmail"
              type="email"
              required
              placeholder="Alamat email kamu"
              class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink font-medium"
            />
            <p class="text-[10px] text-ink-muted mt-1">
              Gunakan email aktif untuk pemulihan akun.
            </p>
          </div>

          <!-- Password Input -->
          <div>
            <label class="block font-semibold text-ink mb-1">Buat kata sandi *</label>
            <div class="relative">
              <input
                v-model="regPassword"
                :type="showRegPassword ? 'text' : 'password'"
                required
                placeholder="Minimal 8 karakter"
                class="w-full p-2.5 pr-9 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink font-mono"
              />
              <button
                type="button"
                @click="showRegPassword = !showRegPassword"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              >
                <EyeOff v-if="showRegPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p class="text-[10px] text-ink-muted mt-1">
              Gunakan kombinasi huruf dan angka.
            </p>
          </div>

          <!-- Confirm Password Input -->
          <div>
            <label class="block font-semibold text-ink mb-1">Ulangi kata sandi *</label>
            <input
              v-model="regConfirmPassword"
              type="password"
              required
              placeholder="Ketik ulang kata sandi"
              class="w-full p-2.5 bg-surface border border-border rounded-sm focus:outline-none focus:border-ink font-mono"
            />
          </div>

          <!-- Terms Checkbox -->
          <label class="flex items-start gap-2 cursor-pointer text-xs text-ink leading-snug select-none pt-1">
            <input v-model="agreePolicy" type="checkbox" class="accent-primary mt-0.5" />
            <span>Saya setuju dengan Pedoman Komunitas dan Kebijakan Privasi Menfessin Aja.</span>
          </label>

          <!-- Turnstile Placeholder -->
          <div class="p-3 bg-surface border border-border rounded-sm flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-primary" />
              <div>
                <div class="font-semibold text-ink text-[11px]">Verifikasi manusia</div>
                <div class="text-[10px] text-ink-muted">Cloudflare Turnstile · placeholder demo</div>
              </div>
            </div>
            <span class="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5" /> Terverifikasi
            </span>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-sm transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Buat akun</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>

          <p class="text-[10px] text-ink-muted leading-normal">
            Semua kolom wajib diisi. Kata sandi harus sama. Pendaftaran tidak meminta nama asli, nomor HP, atau NIM.
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
