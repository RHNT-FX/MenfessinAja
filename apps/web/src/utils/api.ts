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

    // Jika status 500 atau 404 pada Vercel, fallback mulus ke Mock Backend
    console.warn(`[API] Server status ${response.status} pada ${endpoint}. Menggunakan fallback mock.`);
    return handleMockRequest(endpoint, options) as T;
  } catch {
    // Jika network error, fallback mulus ke Mock Backend
    console.warn(`[API] Network error pada ${endpoint}. Menggunakan fallback mock.`);
    return handleMockRequest(endpoint, options) as T;
  }
}
