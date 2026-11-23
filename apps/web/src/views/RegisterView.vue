<script setup lang="ts">
import TurnstileWidget from '@/components/common/TurnstileWidget.vue';
import { useAuthStore } from '@/stores/auth';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  UserPlus
} from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

// Register Form State
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const agreePolicy = ref(true);
const turnstileToken = ref('demo-turnstile-token');
const isSubmitting = ref(false);
const regError = ref('');
const regSuccess = ref('');

// Real-time Validations
const emailError = computed(() => {
  if (!email.value) return 'Email wajib diisi';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) return 'Format email tidak valid (harus mengandung @ dan nama domain)';
  return '';
});

const passwordError = computed(() => {
  if (!password.value) return 'Kata sandi wajib diisi';
  if (password.value.length < 8) return 'Kata sandi minimal 8 karakter';
  return '';
});

const confirmPasswordError = computed(() => {
  if (!confirmPassword.value) return 'Konfirmasi kata sandi wajib diisi';
  if (confirmPassword.value !== password.value) return 'Konfirmasi kata sandi tidak cocok dengan kata sandi di atas';
  return '';
});

const isFormValid = computed(() => {
  return (
    !emailError.value &&
    !passwordError.value &&
    !confirmPasswordError.value &&
    agreePolicy.value &&
    Boolean(turnstileToken.value)
  );
});

async function handleRegister() {
  if (emailError.value) {
    regError.value = emailError.value;
    return;
  }
  if (passwordError.value) {
    regError.value = passwordError.value;
    return;
  }
  if (confirmPasswordError.value) {
    regError.value = confirmPasswordError.value;
    return;
  }
  if (!agreePolicy.value) {
    regError.value = 'Anda wajib menyetujui Pedoman Komunitas & Kebijakan Privasi';
    return;
  }
  if (!turnstileToken.value) {
    regError.value = 'Silakan selesaikan verifikasi Cloudflare Turnstile';
    return;
  }

  regError.value = '';
  isSubmitting.value = true;

  try {
    await authStore.register(email.value, password.value, turnstileToken.value);
    regSuccess.value = 'Pendaftaran akun berhasil! Mengalihkan ke beranda linimasa...';
    setTimeout(() => {
      router.push('/');
    }, 1200);
  } catch (err: any) {
    regError.value = err.message || 'Pendaftaran gagal. Silakan coba kembali.';
  } finally {
    isSubmitting.value = false;
  }
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
      <!-- Left Column: Information & Privacy Promise -->
      <div class="lg:col-span-5 space-y-6">
        <div>
          <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight mb-3">
            Bergabung.<br />Tanpa Mengorbankan Privasi.
          </h1>
          <p class="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Daftarkan akunmu untuk mulai menulis menfess, berpartisipasi dalam diskusi, jual-beli barang bekas, dan melapor barang hilang di kampus.
          </p>
        </div>

        <!-- Privacy Assurance Card -->
        <div class="p-5 bg-surface border border-border rounded-sm space-y-3.5 text-xs text-ink shadow-xs">
          <div class="font-bold text-ink flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 text-emerald-700" />
            <span>Jaminan Privasi & Anonimitas</span>
          </div>
          <ul class="space-y-2 text-ink-muted text-[11px] leading-relaxed">
            <li class="flex items-start gap-2">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Email kamu tidak akan pernah ditampilkan pada postingan publik atau profil siapapun.</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Pendaftaran tidak meminta nama lengkap, NIM, foto kartu mahasiswa, atau nomor handphone.</span>
            </li>
            <li class="flex items-start gap-2">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Kata sandi dienkripsi dengan standar industri (Bcrypt salt rounds 10).</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Right Column: Dedicated Register Form Card -->
      <div class="lg:col-span-7 bg-surface border border-border p-6 sm:p-8 rounded-sm shadow-xs space-y-5">
        <div>
          <div class="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
            Registrasi Anggota Baru
          </div>
          <h2 class="font-serif text-2xl text-ink font-normal">
            Bikin Akun Baru
          </h2>
          <p class="text-xs text-ink-muted mt-1">
            Isi formulir di bawah ini untuk mendapatkan akses penuh menulis dan berkomentar.
          </p>
        </div>

        <!-- Success Banner -->
        <div v-if="regSuccess" class="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-start gap-2">
          <CheckCircle2 class="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
          <span>{{ regSuccess }}</span>
        </div>

        <!-- Error Alert Banner -->
        <div v-if="regError" class="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-start gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{{ regError }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4 text-xs">
          <!-- Email Input -->
          <div>
            <label class="block font-semibold text-ink mb-1">
              Alamat Email Aktif *
            </label>
            <div class="relative">
              <Mail class="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
              <input
                v-model="email"
                type="email"
                required
                placeholder="email@kampus.ac.id atau email pribadi"
                class="w-full pl-9 pr-3 py-2.5 bg-canvas border rounded-sm focus:outline-none transition-colors"
                :class="email && emailError ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
              />
            </div>
            <p v-if="email && emailError" class="text-[11px] text-red-600 mt-1">
              {{ emailError }}
            </p>
            <p v-else class="text-[10px] text-ink-muted mt-1">
              Hanya digunakan untuk pemulihan akun & keamanan, tidak akan dipublikasikan.
            </p>
          </div>

          <!-- Password Input -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-semibold text-ink">Buat Kata Sandi *</label>
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
                placeholder="Minimal 8 karakter kombinasi huruf & angka"
                class="w-full pl-9 pr-3 py-2.5 bg-canvas border rounded-sm focus:outline-none transition-colors"
                :class="password && passwordError ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
              />
            </div>
            <p v-if="password && passwordError" class="text-[11px] text-red-600 mt-1">
              {{ passwordError }}
            </p>
            <p v-else-if="password.length >= 8" class="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 class="w-3 h-3" />
              <span>Panjang kata sandi memenuhi syarat</span>
            </p>
          </div>

          <!-- Confirm Password Input -->
          <div>
            <label class="block font-semibold text-ink mb-1">
              Ulangi Kata Sandi *
            </label>
            <div class="relative">
              <Lock class="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
              <input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Ketik ulang kata sandi yang sama persis"
                class="w-full pl-9 pr-3 py-2.5 bg-canvas border rounded-sm focus:outline-none transition-colors"
                :class="confirmPassword && confirmPasswordError ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
              />
            </div>
            <p v-if="confirmPassword && confirmPasswordError" class="text-[11px] text-red-600 mt-1">
              {{ confirmPasswordError }}
            </p>
            <p v-else-if="confirmPassword && !confirmPasswordError" class="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 class="w-3 h-3" />
              <span>Kata sandi cocok persis</span>
            </p>
          </div>

          <!-- Community Policy Checkbox -->
          <div class="pt-1">
            <label class="flex items-start gap-2.5 cursor-pointer select-none text-ink">
              <input v-model="agreePolicy" type="checkbox" class="accent-primary rounded-xs mt-0.5" />
              <span class="text-xs leading-relaxed text-ink-muted">
                Saya setuju dengan
                <router-link to="/pedoman" target="_blank" class="text-primary underline font-medium">Pedoman Komunitas</router-link>
                dan
                <router-link to="/privasi" target="_blank" class="text-primary underline font-medium">Kebijakan Privasi</router-link>
                Menfessin Aja (tidak melakukan doxxing, ujaran kebencian, atau penipuan).
              </span>
            </label>
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
              <UserPlus class="w-3.5 h-3.5" />
              <span>{{ isSubmitting ? 'Mendaftarkan Akun...' : 'Buat Akun Sekarang' }}</span>
            </button>
          </div>
        </form>

        <!-- Switch to Login Screen Banner -->
        <div class="border-t border-border pt-4 text-center text-xs text-ink-muted space-y-2">
          <p>
            Sudah memiliki akun terdaftar?
          </p>
          <router-link
            to="/login"
            class="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
          >
            <span>Masuk ke akunmu di sini</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
