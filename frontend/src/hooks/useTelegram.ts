import { useCallback, useMemo } from 'react';
import WebApp from '@twa-dev/sdk';

/**
 * Обёртка над Telegram WebApp SDK.
 * Предоставляет безопасный доступ к основным методам и данным Telegram Mini App.
 * При использовании вне Telegram (режим разработки) вызовы SDK оборачиваются в try/catch.
 */
export const useTelegram = () => {
  const webApp = WebApp;

  // Данные текущего пользователя из initDataUnsafe
  const user = useMemo(() => {
    try {
      return webApp.initDataUnsafe?.user ?? null;
    } catch {
      return null;
    }
  }, [webApp]);

  // Цветовая схема: 'dark' или 'light'
  const colorScheme = useMemo((): 'dark' | 'light' => {
    try {
      return webApp.colorScheme || 'dark';
    } catch {
      return 'dark';
    }
  }, [webApp]);

  // Параметры темы Telegram
  const themeParams = useMemo(() => {
    try {
      return webApp.themeParams;
    } catch {
      return {};
    }
  }, [webApp]);

  // Тактильная обратная связь (хаптик)
  const haptic = useMemo(
    () => ({
      impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
        try {
          webApp.HapticFeedback.impactOccurred(style);
        } catch {
          // Хаптик недоступен вне Telegram
        }
      },
      notification: (type: 'error' | 'success' | 'warning') => {
        try {
          webApp.HapticFeedback.notificationOccurred(type);
        } catch {
          // Хаптик недоступен вне Telegram
        }
      },
      selection: () => {
        try {
          webApp.HapticFeedback.selectionChanged();
        } catch {
          // Хаптик недоступен вне Telegram
        }
      },
    }),
    [webApp],
  );

  // Показать/скрыть кнопку «Назад»
  const showBackButton = useCallback(
    (show: boolean) => {
      try {
        if (show) {
          webApp.BackButton.show();
        } else {
          webApp.BackButton.hide();
        }
      } catch {
        // BackButton недоступна вне Telegram
      }
    },
    [webApp],
  );

  // Закрыть Mini App
  const close = useCallback(() => {
    try {
      webApp.close();
    } catch {
      // close недоступен вне Telegram
    }
  }, [webApp]);

  // Раскрыть на полную высоту
  const expand = useCallback(() => {
    try {
      webApp.expand();
    } catch {
      // expand недоступен вне Telegram
    }
  }, [webApp]);

  return {
    webApp,
    user,
    colorScheme,
    themeParams,
    haptic,
    showBackButton,
    close,
    expand,
  };
};
