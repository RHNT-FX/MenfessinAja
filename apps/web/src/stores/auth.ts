import type { User } from '@menfessin-aja/shared';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const isAdmin = computed(() => user.value?.role === 'admin');

  function setAuth(newUser: User, newToken: string) {
    user.value = newUser;
    token.value = newToken;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function initFromStorage() {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        token.value = savedToken;
        user.value = JSON.parse(savedUser);
      } catch {
        logout();
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    setAuth,
    logout,
    initFromStorage
  };
});
