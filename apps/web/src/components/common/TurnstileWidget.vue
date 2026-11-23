<script setup lang="ts">
import { Check, Loader2, RefreshCw, ShieldCheck } from 'lucide-vue-next';
import { onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    siteKey?: string;
    autoVerify?: boolean;
    label?: string;
  }>(),
  {
    modelValue: '',
    siteKey: '1x00000000000000000000AA',
    autoVerify: false,
    label: 'Verifikasi bahwa Anda adalah manusia'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', token: string): void;
  (e: 'success', token: string): void;
  (e: 'reset'): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const widgetId = ref<string | null>(null);
const isNativeTurnstileActive = ref(false);

// State mode lokal / offline simulation
const isVerifying = ref(false);
const isVerified = ref(Boolean(props.modelValue));

watch(
  () => props.modelValue,
  (newVal) => {
    isVerified.value = Boolean(newVal);
  }
);

onMounted(() => {
  initTurnstile();
});

function initTurnstile() {
  // Cek jika script Cloudflare Turnstile native tersedia di window
  if (typeof window !== 'undefined' && (window as any).turnstile && containerRef.value) {
    try {
      isNativeTurnstileActive.value = true;
      widgetId.value = (window as any).turnstile.render(containerRef.value, {
        sitekey: props.siteKey || '1x00000000000000000000AA',
        callback: (token: string) => {
          isVerified.value = true;
          isVerifying.value = false;
          emit('update:modelValue', token);
          emit('success', token);
        },
        'error-callback': () => {
          // Jika gagal / offline, fallback ke simulator interaktif
          isNativeTurnstileActive.value = false;
        }
      });
      return;
    } catch {
      isNativeTurnstileActive.value = false;
    }
  }

  // Jika script native tidak aktif atau dalam mode offline, jalankan simulator
  if (props.autoVerify && !isVerified.value) {
    triggerOfflineVerification();
  }
}

function handleBoxClick() {
  if (isVerifying.value || isVerified.value) return;
  triggerOfflineVerification();
}

function triggerOfflineVerification() {
  isVerifying.value = true;
  setTimeout(() => {
    isVerifying.value = false;
    isVerified.value = true;
    const token = 'cf-turnstile-verified-token-' + Date.now();
    emit('update:modelValue', token);
    emit('success', token);
  }, 450); // delay realistis ~450ms
}

function handleReset(e: Event) {
  e.stopPropagation();
  isVerified.value = false;
  isVerifying.value = false;
  emit('update:modelValue', '');
  emit('reset');

  if (isNativeTurnstileActive.value && widgetId.value && (window as any).turnstile) {
    (window as any).turnstile.reset(widgetId.value);
  }
}
</script>

<template>
  <div class="select-none my-1">
    <!-- Container untuk widget native Cloudflare Turnstile (jika script online) -->
    <div v-show="isNativeTurnstileActive" ref="containerRef" class="my-1"></div>

    <!-- Interactive Offline / Standalone Cloudflare Widget -->
    <div
      v-show="!isNativeTurnstileActive"
      @click="handleBoxClick"
      class="bg-surface border border-border rounded-sm p-3 flex items-center justify-between gap-3 transition-all cursor-pointer hover:border-ink/40 shadow-xs"
      :class="{
        'border-emerald-600/40 bg-emerald-50/20': isVerified,
        'pointer-events-none': isVerifying
      }"
      title="Klik untuk verifikasi Cloudflare Turnstile"
    >
      <div class="flex items-center gap-3">
        <!-- Checkbox / Spinner / Checkmark Box -->
        <div
          class="w-6 h-6 rounded-xs border flex items-center justify-center transition-all bg-canvas shrink-0"
          :class="[
            isVerified
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : isVerifying
              ? 'border-primary'
              : 'border-ink/30 hover:border-ink'
          ]"
        >
          <Check v-if="isVerified" class="w-4 h-4 stroke-[3]" />
          <Loader2 v-else-if="isVerifying" class="w-4 h-4 text-primary animate-spin" />
        </div>

        <div>
          <div class="text-xs font-semibold text-ink flex items-center gap-1.5">
            <span>{{ isVerified ? 'Verifikasi Manusia Berhasil' : label }}</span>
          </div>
          <div class="text-[10px] text-ink-muted flex items-center gap-1">
            <span>Cloudflare Turnstile</span>
            <span>·</span>
            <span class="text-emerald-700 font-medium">Bekerja Offline / Lokal</span>
          </div>
        </div>
      </div>

      <!-- Cloudflare Branding & Status -->
      <div class="flex flex-col items-end shrink-0">
        <div class="flex items-center gap-1 text-[#F38020] font-bold text-[11px]">
          <ShieldCheck class="w-4 h-4 text-[#F38020]" />
          <span class="tracking-tighter">CLOUDFLARE</span>
        </div>
        <div class="flex items-center gap-1.5 text-[9px] text-ink-muted">
          <span v-if="isVerified" @click="handleReset" class="hover:underline text-ink cursor-pointer flex items-center gap-0.5">
            <RefreshCw class="w-2.5 h-2.5" /> Ulangi
          </span>
          <span v-else>Privasi · Ketentuan</span>
        </div>
      </div>
    </div>
  </div>
</template>
