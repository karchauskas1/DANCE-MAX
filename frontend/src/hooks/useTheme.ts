import { useEffect, useMemo } from 'react';
import { useTelegram } from './useTelegram';

/**
 * Хук для определения и применения темы из Telegram.
 *
 * - Если colorScheme из Telegram = 'light' → устанавливает data-theme="light" на <html>
 * - Иначе → удаляет data-theme (тёмная тема по умолчанию)
 * - Обновляет meta-тег theme-color для корректного отображения в системе
 */
export const useTheme = () => {
  const { colorScheme, themeParams } = useTelegram();

  const theme = useMemo((): 'dark' | 'light' => {
    return colorScheme === 'light' ? 'light' : 'dark';
  }, [colorScheme]);

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }

    // Обновляем meta theme-color для системного UI (статус-бар и т.д.)
    const bgColor =
      themeParams?.bg_color || (isDark ? '#1a1a2e' : '#ffffff');

    let metaTag = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );

    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'theme-color';
      document.head.appendChild(metaTag);
    }

    metaTag.content = bgColor;
  }, [theme, isDark, themeParams]);

  return { theme, isDark };
};
