import { useAuthStore } from '../store/auth';

const BASE_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * HTTP-клиент для взаимодействия с бэкендом.
 * Автоматически подставляет Bearer-токен из Zustand-стора авторизации.
 */

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody?.message ||
        errorBody?.detail ||
        `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }

    // Если ответ пустой (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    // Если токен протух — очищаем авторизацию
    if (error instanceof Error && error.message.includes('401')) {
      useAuthStore.getState().clearAuth();
    }
    throw error;
  }
}

export const apiClient = {
  get: <T>(endpoint: string): Promise<T> =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown): Promise<T> =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string): Promise<T> =>
    request<T>(endpoint, { method: 'DELETE' }),
};
