<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import { useAuthStore } from '@/stores/auth';
import { apiFetch } from '@/utils/api';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Mail,
  RotateCcw,
  ShieldCheck,
  User as UserIcon
} from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

type TabKey = 'profile' | 'security' | 'activity' | 'privacy';
const activeTab = ref<TabKey>('profile');

// --- Tab 1: Ganti Email State ---
const emailInput = ref(authStore.user?.email || '');
const isSavingEmail = ref(false);
const emailSuccess = ref('');
const emailError = ref('');

const emailValidation = computed(() => {
  if (!emailInput.value.trim()) return 'Email wajib diisi';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
    return 'Format alamat email tidak valid';
  }
  return '';
});

async function handleUpdateEmail() {
  if (emailValidation.value) {
    emailError.value = emailValidation.value;
    return;
  }
  emailError.value = '';
  emailSuccess.value = '';
  isSavingEmail.value = true;

  try {
    await authStore.updateProfile(emailInput.value.trim());
    emailSuccess.value = 'Alamat email akun berhasil diperbarui!';
    setTimeout(() => {
      emailSuccess.value = '';
    }, 4000);
  } catch (err: any) {
    emailError.value = err.message || 'Gagal memperbarui email akun';
  } finally {
    isSavingEmail.value = false;
  }
}

// --- Tab 2: Ganti Password State ---
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const isSavingPassword = ref(false);
const passwordSuccess = ref('');
const passwordError = ref('');

const passwordValidation = computed(() => {
  if (!oldPassword.value) return 'Kata sandi saat ini wajib diisi';
  if (!newPassword.value) return 'Kata sandi baru wajib diisi';
  if (newPassword.value.length < 8) return 'Kata sandi baru minimal 8 karakter';
  if (newPassword.value === oldPassword.value) return 'Kata sandi baru tidak boleh sama dengan kata sandi lama';
  if (newPassword.value !== confirmPassword.value) return 'Konfirmasi kata sandi tidak cocok';
  return '';
});

async function handleUpdatePassword() {
  if (passwordValidation.value) {
    passwordError.value = passwordValidation.value;
    return;
  }
  passwordError.value = '';
  passwordSuccess.value = '';
  isSavingPassword.value = true;

  try {
    await authStore.updatePassword(oldPassword.value, newPassword.value);
    passwordSuccess.value = 'Kata sandi berhasil diperbarui! Silakan gunakan kata sandi baru untuk login selanjutnya.';
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    setTimeout(() => {
      passwordSuccess.value = '';
    }, 4000);
  } catch (err: any) {
    passwordError.value = err.message || 'Gagal memperbarui kata sandi';
  } finally {
    isSavingPassword.value = false;
  }
}

// --- Tab 3: Aktivitas Saya State ---
const activityFilter = ref<'menfess' | 'marketplace' | 'lost_found'>('menfess');
const myActivities = ref<any[]>([]);
const isLoadingActivities = ref(false);

onMounted(() => {
  loadMyActivities();
});

async function loadMyActivities() {
  isLoadingActivities.value = true;
  try {
    const res = await apiFetch('/api/posts');
    if (res.success && res.data?.items) {
      // Filter postingan milik user saat ini
      const userId = authStore.user?.id;
      myActivities.value = res.data.items.filter((item: any) => {
        return !userId || item.user_id === userId || item.user_id?.startsWith('00000000-0000');
      });
    }
  } catch {
    myActivities.value = [];
  } finally {
    isLoadingActivities.value = false;
  }
}

const filteredActivities = computed(() => {
  return myActivities.value.filter((item) => {
    if (activityFilter.value === 'menfess') return item.kategori === 'menfess';
    if (activityFilter.value === 'marketplace') return item.kategori === 'marketplace';
    if (activityFilter.value === 'lost_found') return item.kategori === 'lost_found';
    return true;
  });
});

// --- Tab 4: Privasi & Keluar ---
function handleLogout() {
  if (confirm('Apakah kamu yakin ingin keluar dari akun Menfessin Aja?')) {
    authStore.logout();
    router.push('/');
  }
}

function handleClearLocalCache() {
  try {
    localStorage.removeItem('menfessinaja_mock_posts');
    localStorage.removeItem('menfessinaja_comments');
    alert('Cache lokal linimasa berhasil dibersihkan.');
    window.location.reload();
  } catch {}
}

function formatDate(isoStr?: string) {
  if (!isoStr) return 'Oktober 2026';
  try {
    const date = new Date(isoStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return 'Oktober 2026';
  }
}

const userInitials = computed(() => {
  const email = authStore.user?.email || 'Student';
  return email.charAt(0).toUpperCase();
});
</script>

<template>
  <div class="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 w-full max-w-full">
    <!-- Left Sidebar (Sesuai Figma) -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 min-w-0 w-full space-y-6">
      <!-- Header Section -->
      <div>
        <div class="text-[11px] font-semibold text-ink-muted tracking-wider uppercase mb-1">
          AKUN SAYA / PENGATURAN
        </div>
        <h1 class="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight">
          Profil & Keamanan Akun
        </h1>
        <p class="text-xs sm:text-sm text-ink-muted mt-1.5">
          Kelola informasi akun, ganti kata sandi, dan pantau aktivitas kirimanmu di kampus.
        </p>
      </div>

      <!-- Identity Card Banner (Sesuai Figma Aesthetic) -->
      <div class="bg-surface border border-border p-5 sm:p-6 rounded-sm shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <!-- Initial Avatar -->
          <div class="w-14 h-14 rounded-full bg-primary text-white font-serif text-2xl font-bold flex items-center justify-center shrink-0 shadow-xs ring-4 ring-primary-soft">
            {{ userInitials }}
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="font-bold text-ink text-base sm:text-lg">
                {{ authStore.user?.email || 'Pengguna Menfessin Aja' }}
              </h2>
              <span
                class="px-2.5 py-0.5 text-[10px] font-bold rounded-full"
                :class="authStore.isAdmin ? 'bg-ink text-canvas' : 'bg-primary-soft text-primary'"
              >
                {{ authStore.isAdmin ? 'Admin Moderator' : 'Anggota Kampus' }}
              </span>
            </div>

            <div class="flex items-center gap-4 text-xs text-ink-muted mt-1">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Aktif • Sesi Aman</span>
              </span>
              <span>·</span>
              <span class="flex items-center gap-1">
                <Calendar class="w-3.5 h-3.5" />
                <span>Terdaftar {{ formatDate(authStore.user?.created_at) }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Logout Action -->
        <button
          @click="handleLogout"
          class="border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-sm transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-[0.99] cursor-pointer"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>Keluar Akun</span>
        </button>
      </div>

      <!-- Main Layout: Navigation Tabs (Left) & Active Card (Right) -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <!-- Tab Navigation Buttons -->
        <div class="md:col-span-4 bg-surface border border-border rounded-sm p-2 space-y-1 shadow-xs">
          <button
            @click="activeTab = 'profile'"
            class="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-sm transition-all text-left"
            :class="activeTab === 'profile' ? 'bg-primary-soft text-primary font-bold' : 'text-ink hover:bg-surface-muted'"
          >
            <UserIcon class="w-4 h-4 shrink-0" />
            <span>Informasi Profil & Email</span>
          </button>

          <button
            @click="activeTab = 'security'"
            class="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-sm transition-all text-left"
            :class="activeTab === 'security' ? 'bg-primary-soft text-primary font-bold' : 'text-ink hover:bg-surface-muted'"
          >
            <Lock class="w-4 h-4 shrink-0" />
            <span>Keamanan & Kata Sandi</span>
          </button>

          <button
            @click="activeTab = 'activity'"
            class="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-sm transition-all text-left"
            :class="activeTab === 'activity' ? 'bg-primary-soft text-primary font-bold' : 'text-ink hover:bg-surface-muted'"
          >
            <Activity class="w-4 h-4 shrink-0" />
            <span>Aktivitas & Riwayat Saya</span>
          </button>

          <button
            @click="activeTab = 'privacy'"
            class="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-sm transition-all text-left"
            :class="activeTab === 'privacy' ? 'bg-primary-soft text-primary font-bold' : 'text-ink hover:bg-surface-muted'"
          >
            <ShieldCheck class="w-4 h-4 shrink-0" />
            <span>Privasi & Sesi Login</span>
          </button>
        </div>

        <!-- Tab Content Card -->
        <div class="md:col-span-8 bg-surface border border-border rounded-sm p-6 sm:p-7 shadow-xs">
          <!-- TAB 1: INFORMASI PROFIL & GANTI EMAIL -->
          <div v-if="activeTab === 'profile'" class="space-y-5">
            <div>
              <h2 class="font-serif text-xl text-ink font-normal">
                Informasi Akun & Email
              </h2>
              <p class="text-xs text-ink-muted mt-1 leading-relaxed">
                Email kamu hanya digunakan untuk masuk dan menerima pemulihan sandi. Alamat email tidak pernah ditampilkan pada postingan linimasa atau publik.
              </p>
            </div>

            <!-- Feedback Alert Banners -->
            <div v-if="emailSuccess" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{{ emailSuccess }}</span>
            </div>
            <div v-if="emailError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-center gap-2">
              <AlertCircle class="w-4 h-4 shrink-0 text-red-600" />
              <span>{{ emailError }}</span>
            </div>

            <form @submit.prevent="handleUpdateEmail" class="space-y-4 text-xs">
              <div>
                <label class="block font-semibold text-ink mb-1.5">Alamat Email *</label>
                <div class="relative">
                  <Mail class="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                  <input
                    v-model="emailInput"
                    type="email"
                    required
                    placeholder="nama@kampus.ac.id"
                    class="w-full pl-9 pr-3 py-2.5 bg-canvas border rounded-sm focus:outline-none transition-colors"
                    :class="emailInput && emailValidation ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
                  />
                </div>
                <p v-if="emailInput && emailValidation" class="text-[11px] text-red-500 mt-1">
                  {{ emailValidation }}
                </p>
                <p class="text-[11px] text-ink-muted mt-1">
                  Contoh email kampus atau email pribadi yang aktif.
                </p>
              </div>

              <div>
                <label class="block font-semibold text-ink mb-1.5">Peran Akun</label>
                <input
                  :value="authStore.isAdmin ? 'Administrator / Moderator' : 'Anggota Biasa (Mahasiswa)'"
                  type="text"
                  disabled
                  class="w-full p-2.5 bg-surface-muted border border-border rounded-sm text-ink-muted cursor-not-allowed font-medium"
                />
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="isSavingEmail || Boolean(emailValidation) || emailInput === authStore.user?.email"
                  class="bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-semibold py-2.5 px-5 rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  <Loader2 v-if="isSavingEmail" class="w-3.5 h-3.5 animate-spin" />
                  <span>Simpan Perubahan Email</span>
                </button>
              </div>
            </form>
          </div>

          <!-- TAB 2: KEAMANAN & GANTI KATA SANDI -->
          <div v-else-if="activeTab === 'security'" class="space-y-5">
            <div>
              <h2 class="font-serif text-xl text-ink font-normal">
                Ganti Kata Sandi
              </h2>
              <p class="text-xs text-ink-muted mt-1 leading-relaxed">
                Pastikan menggunakan kata sandi yang kuat dan tidak digunakan di situs lain untuk mengamankan akunmu.
              </p>
            </div>

            <!-- Feedback Alert Banners -->
            <div v-if="passwordSuccess" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm flex items-center gap-2">
              <CheckCircle2 class="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{{ passwordSuccess }}</span>
            </div>
            <div v-if="passwordError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-center gap-2">
              <AlertCircle class="w-4 h-4 shrink-0 text-red-600" />
              <span>{{ passwordError }}</span>
            </div>

            <form @submit.prevent="handleUpdatePassword" class="space-y-4 text-xs">
              <!-- Old Password -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="font-semibold text-ink">Kata Sandi Saat Ini *</label>
                  <button
                    type="button"
                    @click="showOldPassword = !showOldPassword"
                    class="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <EyeOff v-if="showOldPassword" class="w-3.5 h-3.5" />
                    <Eye v-else class="w-3.5 h-3.5" />
                    <span>{{ showOldPassword ? 'Sembunyikan' : 'Lihat' }}</span>
                  </button>
                </div>
                <div class="relative">
                  <KeyRound class="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                  <input
                    v-model="oldPassword"
                    :type="showOldPassword ? 'text' : 'password'"
                    required
                    placeholder="Masukkan sandi lama"
                    class="w-full pl-9 pr-3 py-2.5 bg-canvas border border-border rounded-sm focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
              </div>

              <!-- New Password -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="font-semibold text-ink">Kata Sandi Baru *</label>
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <EyeOff v-if="showNewPassword" class="w-3.5 h-3.5" />
                    <Eye v-else class="w-3.5 h-3.5" />
                    <span>{{ showNewPassword ? 'Sembunyikan' : 'Lihat' }}</span>
                  </button>
                </div>
                <div class="relative">
                  <Lock class="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                  <input
                    v-model="newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    required
                    placeholder="Minimal 8 karakter"
                    class="w-full pl-9 pr-3 py-2.5 bg-canvas border rounded-sm focus:outline-none transition-colors"
                    :class="newPassword && newPassword.length < 8 ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
                  />
                </div>
                <p v-if="newPassword && newPassword.length < 8" class="text-[11px] text-red-500 mt-1">
                  Kata sandi baru minimal 8 karakter
                </p>
              </div>

              <!-- Confirm New Password -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="font-semibold text-ink">Ulangi Kata Sandi Baru *</label>
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <EyeOff v-if="showConfirmPassword" class="w-3.5 h-3.5" />
                    <Eye v-else class="w-3.5 h-3.5" />
                    <span>{{ showConfirmPassword ? 'Sembunyikan' : 'Lihat' }}</span>
                  </button>
                </div>
                <div class="relative">
                  <Lock class="w-4 h-4 absolute left-3 top-3 text-ink-muted" />
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    required
                    placeholder="Ketik ulang sandi baru"
                    class="w-full pl-9 pr-3 py-2.5 bg-canvas border rounded-sm focus:outline-none transition-colors"
                    :class="confirmPassword && confirmPassword !== newPassword ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink'"
                  />
                </div>
                <p v-if="confirmPassword && confirmPassword !== newPassword" class="text-[11px] text-red-500 mt-1">
                  Konfirmasi kata sandi tidak cocok
                </p>
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="isSavingPassword || Boolean(passwordValidation)"
                  class="bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-semibold py-2.5 px-5 rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                >
                  <Loader2 v-if="isSavingPassword" class="w-3.5 h-3.5 animate-spin" />
                  <span>Perbarui Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>

          <!-- TAB 3: AKTIVITAS SAYA -->
          <div v-else-if="activeTab === 'activity'" class="space-y-5">
            <div>
              <h2 class="font-serif text-xl text-ink font-normal">
                Aktivitas & Riwayat Saya
              </h2>
              <p class="text-xs text-ink-muted mt-1 leading-relaxed">
                Daftar semua kiriman cerita, barang jualan, dan laporan barang hilang yang kamu publikasikan.
              </p>
            </div>

            <!-- Sub Filter Tabs -->
            <div class="flex items-center gap-2 border-b border-border pb-3 text-xs">
              <button
                @click="activityFilter = 'menfess'"
                class="px-3 py-1.5 rounded-sm font-semibold transition-colors"
                :class="activityFilter === 'menfess' ? 'bg-ink text-white' : 'bg-surface border border-border text-ink hover:bg-surface-muted'"
              >
                Menfess Saya
              </button>
              <button
                @click="activityFilter = 'marketplace'"
                class="px-3 py-1.5 rounded-sm font-semibold transition-colors"
                :class="activityFilter === 'marketplace' ? 'bg-ink text-white' : 'bg-surface border border-border text-ink hover:bg-surface-muted'"
              >
                Pasar Kampus
              </button>
              <button
                @click="activityFilter = 'lost_found'"
                class="px-3 py-1.5 rounded-sm font-semibold transition-colors"
                :class="activityFilter === 'lost_found' ? 'bg-ink text-white' : 'bg-surface border border-border text-ink hover:bg-surface-muted'"
              >
                Lost & Found
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingActivities" class="p-8 text-center text-ink-muted text-xs flex flex-col items-center gap-2">
              <Loader2 class="w-5 h-5 animate-spin text-primary" />
              <span>Memuat riwayat aktivitas...</span>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredActivities.length === 0" class="p-8 text-center bg-canvas border border-dashed border-border rounded-sm text-xs text-ink-muted">
              <p class="font-medium text-ink mb-1">Belum ada riwayat untuk kategori ini.</p>
              <p class="text-[11px]">Kiriman kamu akan otomatis muncul di sini setelah diterbitkan.</p>
            </div>

            <!-- List Cards -->
            <div v-else class="space-y-3">
              <div
                v-for="item in filteredActivities"
                :key="item.id"
                class="p-4 bg-canvas border border-border rounded-sm text-xs space-y-2 hover:border-ink/40 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-primary">
                    {{ item.extra_meta?.category_pill || item.extra_meta?.judul || item.kategori }}
                  </span>
                  <span
                    class="px-2 py-0.5 text-[10px] font-bold rounded-xs"
                    :class="item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'"
                  >
                    {{ item.status === 'approved' ? 'Disetujui' : item.status }}
                  </span>
                </div>

                <p class="text-ink leading-relaxed line-clamp-2">
                  {{ item.teks_konten }}
                </p>

                <div class="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-ink-muted">
                  <span class="flex items-center gap-1">
                    <Clock class="w-3 h-3" />
                    <span>{{ formatDate(item.created_at) }}</span>
                  </span>
                  <span v-if="item.upvotes_count !== undefined">
                    {{ item.upvotes_count }} Upvote · {{ item.comments_count || 0 }} Komentar
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 4: PRIVASI & KELUAR -->
          <div v-else-if="activeTab === 'privacy'" class="space-y-5">
            <div>
              <h2 class="font-serif text-xl text-ink font-normal">
                Privasi & Sesi Perangkat
              </h2>
              <p class="text-xs text-ink-muted mt-1 leading-relaxed">
                Kelola sesi aktif dan pahami bagaimana Menfessin Aja melindungi identitasmu.
              </p>
            </div>

            <div class="space-y-3 text-xs text-ink">
              <div class="p-4 bg-canvas border border-border rounded-sm space-y-2">
                <div class="font-bold flex items-center gap-2">
                  <ShieldCheck class="w-4 h-4 text-emerald-700" />
                  <span>Sistem Privasi Berlapis</span>
                </div>
                <p class="text-[11px] text-ink-muted leading-relaxed">
                  Menfessin Aja secara otomatis menyamarkan data pribadi sensitif (seperti NIM dan nomor telepon) yang tidak sengaja tertulis pada teks postingan linimasa sebelum ditampilkan ke publik.
                </p>
              </div>

              <div class="p-4 bg-canvas border border-border rounded-sm space-y-2">
                <div class="font-bold flex items-center gap-2">
                  <RotateCcw class="w-4 h-4 text-primary" />
                  <span>Bersihkan Cache Linimasa Lokal</span>
                </div>
                <p class="text-[11px] text-ink-muted leading-relaxed">
                  Jika linimasa atau data transaksi tidak sinkron di browsermu, kamu dapat me-refresh penyimpanan lokal browser.
                </p>
                <button
                  type="button"
                  @click="handleClearLocalCache"
                  class="mt-1 px-3 py-1.5 bg-surface border border-border hover:bg-surface-muted text-ink font-semibold rounded-xs transition-colors"
                >
                  Bersihkan Cache Browser
                </button>
              </div>

              <!-- Danger Zone -->
              <div class="p-4 bg-red-50/50 border border-red-200 rounded-sm space-y-2">
                <div class="font-bold text-red-800 flex items-center gap-2">
                  <LogOut class="w-4 h-4 text-red-700" />
                  <span>Keluar dari Akun</span>
                </div>
                <p class="text-[11px] text-red-700/80 leading-relaxed">
                  Keluar akan menghapus token sesi dari perangkat ini. Kamu harus masuk kembali untuk membuat kiriman atau berkomentar.
                </p>
                <button
                  type="button"
                  @click="handleLogout"
                  class="mt-1 px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-xs transition-colors shadow-xs cursor-pointer"
                >
                  Keluar Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
