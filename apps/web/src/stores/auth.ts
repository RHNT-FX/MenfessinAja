import type { User } from '@menfessin-aja/shared';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { apiFetch } from '../utils/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isLoading = ref(false);

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

  async function login(email: string, password: string, turnstile_token: string) {
    isLoading.value = true;
    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, turnstile_token })
      });
      setAuth(response.data.user, response.data.token);
      return response.data.user;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(email: string, password: string, turnstile_token: string) {
    isLoading.value = true;
    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, turnstile_token })
      });
      setAuth(response.data.user, response.data.token);
      return response.data.user;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return null;
    try {
      const response = await apiFetch('/api/auth/me');
      user.value = response.data.user;
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    } catch {
      logout();
      return null;
    }
  }

  function initFromStorage() {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        token.value = savedToken;
        user.value = JSON.parse(savedUser);
        // Validasi kesegaran sesi token ke backend
        fetchCurrentUser();
      } catch {
        logout();
      }
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchCurrentUser,
    initFromStorage
  };
});
