import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import AdminDashboardView from '../views/AdminDashboardView.vue';
import LoginView from '../views/LoginView.vue';
import LostFoundView from '../views/LostFoundView.vue';
import MarketplaceView from '../views/MarketplaceView.vue';
import RegisterView from '../views/RegisterView.vue';
import TimelineView from '../views/TimelineView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'timeline',
      component: TimelineView,
      meta: { title: 'Linimasa Menfess' }
    },
    {
      path: '/marketplace',
      name: 'marketplace',
      component: MarketplaceView,
      meta: { title: 'Marketplace C2C' }
    },
    {
      path: '/lost-found',
      name: 'lost-found',
      component: LostFoundView,
      meta: { title: 'Lost and Found' }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Masuk Akun', guestOnly: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { title: 'Daftar Akun', guestOnly: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboardView,
      meta: { title: 'Dasbor Moderasi Admin', requiresAdmin: true }
    }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - Menfessin Aja`;
  }

  const authStore = useAuthStore();

  // Guard halaman khusus Admin
  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } });
    }
    if (!authStore.isAdmin) {
      return next({ path: '/' });
    }
  }

  // Guard halaman khusus Tamu / Guest (Login / Register)
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ path: '/' });
  }

  next();
});

export default router;
