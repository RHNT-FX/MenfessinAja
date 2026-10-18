<script setup lang="ts">
import { HelpCircle, MessageSquare, ShoppingBag } from 'lucide-vue-next';
import { useRoute } from 'vue-router';

const route = useRoute();

const tabs = [
  { name: 'Linimasa Menfess', path: '/', icon: MessageSquare },
  { name: 'Marketplace C2C', path: '/marketplace', icon: ShoppingBag },
  { name: 'Lost & Found', path: '/lost-found', icon: HelpCircle },
];
</script>

<template>
  <nav class="flex items-center gap-1.5 p-1.5 bg-surface border border-surface-border rounded-2xl shadow-sm overflow-x-auto">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150"
      :class="[
        route.path === tab.path
          ? 'bg-primary text-white shadow-sm'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      ]"
    >
      <component :is="tab.icon" class="w-4 h-4" />
      <span>{{ tab.name }}</span>
    </router-link>
  </nav>
</template>
