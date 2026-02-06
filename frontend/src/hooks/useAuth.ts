import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/auth';
import type { User } from '../types';

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
  isAdmin: false,
};

const MOCK_TOKEN = 'dev-mock-token';

/** Маппинг snake_case ответа бэкенда в camelCase User */
function mapUserResponse(u: Record<string, unknown>): User {
  return {
    id: u.id as number,
    telegramId: u.telegram_id as number,
    firstName: u.first_name as string,
    lastName: (u.last_name as string) || undefined,
    username: (u.username as string) || undefined,
    phone: (u.phone as string) || undefined,
    photoUrl: (u.photo_url as string) || undefined,
    balance: u.balance as number,
    isAdmin: (u.is_admin as boolean) || false,
  };
}

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

        if (!initData) {
          console.warn(
            '[useAuth] initData отсутствует — используется мок-пользователь',
          );
          setAuth(MOCK_USER, MOCK_TOKEN);
          setIsLoading(false);
          return;
        }

        // Отправляем init_data (snake_case!) на бэкенд
        const response = await apiClient.post<{ token: string; user: Record<string, unknown> }>(
          '/api/auth/telegram',
          { init_data: initData },
        );

        setAuth(mapUserResponse(response.user), response.token);
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
