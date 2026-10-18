<script setup lang="ts">
import { AlertTriangle, Check, CreditCard, Shield, X } from 'lucide-vue-next';
import { ref } from 'vue';
const activeTab = ref<'flagged' | 'transactions' | 'users'>('flagged');

// Demo Flagged Posts sesuai SDD 4.5 & SRS FR-006
const demoFlaggedPosts = ref([
  {
    id: 'flag-1',
    kategori: 'menfess',
    text: 'Dosen yang ngajar matkul Basis Data di kelas B itu kok pelit nilai banget ya? Jangan-jangan dosen titipan...',
    ai_score: 0.88,
    flag_reason: 'Potensi Ujaran Kebencian / Penghinaan (NLP)',
    created_at: '10 menit yang lalu'
  },
  {
    id: 'flag-2',
    kategori: 'marketplace',
    text: 'Dijual akun ujian online beserta bocoran kunci jawaban semester genap. Minat langsung DM!',
    ai_score: 0.94,
    flag_reason: 'Barang/Jasa Terlarang Akademik (NLP + Vision)',
    created_at: '25 menit yang lalu'
  }
]);

// Demo Transactions sesuai SDD 4.8 & SRS FR-007
const demoTransactions = ref([
  {
    order_id: 'TRX-20261018-001',
    user: 'student@menfessinaja.ac.id',
    feature: 'Superchat Pinned Post',
    amount: 15000,
    status: 'settlement',
    time: 'Hari ini 21:10'
  },
  {
    order_id: 'TRX-20261018-002',
    user: 'student@menfessinaja.ac.id',
    feature: 'Boost Listing Marketplace',
    amount: 10000,
    status: 'settlement',
    time: 'Kemarin 14:02'
  }
]);

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Admin -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-sm">
      <div class="flex items-center gap-3">
        <div class="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
          <Shield class="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-bold tracking-tight">Dasbor Moderasi Admin</h1>
          <p class="text-xs text-slate-400">Kelola antrean moderasi AI, audit log transaksi, dan pemblokiran akun</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1.5 p-1 bg-white/10 rounded-2xl backdrop-blur-sm text-xs">
        <button 
          @click="activeTab = 'flagged'"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors"
          :class="activeTab === 'flagged' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'"
        >
          <AlertTriangle class="w-3.5 h-3.5" />
          <span>Antrean Flagged</span>
        </button>
        <button 
          @click="activeTab = 'transactions'"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors"
          :class="activeTab === 'transactions' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'"
        >
          <CreditCard class="w-3.5 h-3.5" />
          <span>Log Transaksi</span>
        </button>
      </div>
    </div>

    <!-- TAB 1: Antrean Moderasi Flagged (Sesuai SDD 4.5) -->
    <div v-if="activeTab === 'flagged'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">Postingan Tertahan Menunggu Tinjauan</h2>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
          {{ demoFlaggedPosts.length }} Perlu Ditinjau
        </span>
      </div>

      <div class="space-y-3">
        <div 
          v-for="item in demoFlaggedPosts" 
          :key="item.id"
          class="p-5 rounded-2xl bg-surface border border-surface-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div class="space-y-2 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {{ item.kategori }}
              </span>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                AI Score: {{ (item.ai_score * 100).toFixed(0) }}% Mencurigakan
              </span>
              <span class="text-xs text-slate-400">{{ item.created_at }}</span>
            </div>

            <p class="text-sm text-slate-800 leading-relaxed font-medium">
              "{{ item.text }}"
            </p>

            <p class="text-xs text-red-600 font-semibold flex items-center gap-1">
              <AlertTriangle class="w-3.5 h-3.5" />
              <span>Deteksi: {{ item.flag_reason }}</span>
            </p>
          </div>

          <!-- Moderation Actions (Approve / Reject) -->
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-border">
            <button 
              class="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Check class="w-3.5 h-3.5" />
              <span>Setujui</span>
            </button>
            <button 
              class="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <X class="w-3.5 h-3.5" />
              <span>Tolak</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Log Transaksi Masuk (Sesuai SDD 4.8) -->
    <div v-if="activeTab === 'transactions'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">Riwayat Transaksi QRIS Midtrans</h2>
      </div>

      <div class="overflow-hidden rounded-2xl bg-surface border border-surface-border shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-surface-border font-semibold text-slate-700">
              <tr>
                <th class="p-3.5">Order ID</th>
                <th class="p-3.5">Fitur</th>
                <th class="p-3.5">Nominal</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5">Waktu</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-border text-slate-600">
              <tr v-for="trx in demoTransactions" :key="trx.order_id" class="hover:bg-slate-50/50">
                <td class="p-3.5 font-mono font-medium text-slate-900">{{ trx.order_id }}</td>
                <td class="p-3.5 font-semibold text-slate-800">{{ trx.feature }}</td>
                <td class="p-3.5 font-bold text-emerald-600">{{ formatRupiah(trx.amount) }}</td>
                <td class="p-3.5">
                  <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    {{ trx.status }}
                  </span>
                </td>
                <td class="p-3.5 text-slate-400">{{ trx.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
