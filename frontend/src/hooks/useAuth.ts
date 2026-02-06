import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/auth';
import type { User } from '../types';
import type { AuthResponse } from '../types/api';

/** Мок-пользователь для режима разработки (когда нет initData от Telegram) */
const MOCK_USER: User = {
  id: 1,
  telegramId: 123456789,
  firstName: 'Тест',
  lastName: 'Пользователь',
  username: 'test_user',
  phone: undefined,
  photoUrl: undefined,
  balance: 0,
};

const MOCK_TOKEN = 'dev-mock-token';

/**
 * Хук авторизации через Telegram Mini App.
 *
 * При монтировании:
 * 1. Получает initData из Telegram WebApp SDK
 * 2. Отправляет на бэкенд POST /api/auth/telegram
 * 3. Сохраняет пользователя и токен в Zustand-стор
 *
 * В режиме разработки (без initData) использует мок-данные.
 */
export const useAuth = () => {
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Если уже авторизованы — не повторяем запрос
    if (isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const authenticate = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let initData = '';

        try {
          initData = WebApp.initData;
        } catch {
          // SDK недоступен вне Telegram
        }

        // Режим разработки: нет initData — используем мок
        if (!initData) {
          console.warn(
            '[useAuth] initData отсутствует — используется мок-пользователь',
          );
          setAuth(MOCK_USER, MOCK_TOKEN);
          setIsLoading(false);
          return;
        }

        // Отправляем initData на бэкенд для верификации
        const response = await apiClient.post<AuthResponse>(
          '/api/auth/telegram',
          { initData },
        );

        setAuth(response.user, response.token);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Ошибка авторизации';
        setError(message);
        console.error('[useAuth] Ошибка авторизации:', err);
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
  }, [isAuthenticated, setAuth]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
  };
};
