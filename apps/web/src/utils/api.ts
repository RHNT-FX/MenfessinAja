import { handleMockRequest } from './mockBackend';

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  let url = endpoint.startsWith('http') ? endpoint : endpoint;

  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return data as T;
    }

    // Tangani penolakan eksplisit dari backend (400, 401, 403, 409, 422, dsb)
    // Jangan disamarkan menjadi mock sukses bila server menolak autentikasi atau validasi!
    if (response.status >= 400 && response.status < 500 && response.status !== 404) {
      const errData = await response.json().catch(() => ({}));
      const message = errData.message || `Permintaan gagal dengan status ${response.status}`;
      throw new Error(message);
    }

    // Jika status 500 atau 404 pada Vercel/offline, fallback mulus ke Mock Backend
    console.warn(`[API] Server status ${response.status} pada ${endpoint}. Menggunakan fallback mock.`);
    return handleMockRequest(endpoint, options) as T;
  } catch (err: any) {
    // Jika error eksplisit dari penolakan server (4xx), lempar ke pemanggil (store / UI)
    if (err instanceof Error && !err.message.toLowerCase().includes('failed to fetch') && !err.message.toLowerCase().includes('networkerror')) {
      throw err;
    }
    // Jika network offline atau backend belum tersedia, fallback ke Mock Backend
    console.warn(`[API] Network error pada ${endpoint}. Menggunakan fallback mock:`, err);
    return handleMockRequest(endpoint, options) as T;
  }
}
