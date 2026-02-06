import { useCallback, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

const STORAGE_KEY = 'dancemax-theme';

type Theme = 'light' | 'dark';

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage unavailable
  }
  return document.documentElement.getAttribute('data-theme') === 'light'
    ? 'light'
    : 'dark';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }

  // Update meta theme-color
  let metaTag = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.name = 'theme-color';
    document.head.appendChild(metaTag);
  }
  metaTag.content = theme === 'light' ? '#ffffff' : '#1a1a2e';

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const isDark = theme === 'dark';

  return (
    <button
      className={styles.toggle}
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      type="button"
    >
      <span className={`${styles.pill} ${isDark ? styles.pillDark : styles.pillLight}`}>
        <span className={`${styles.thumb} ${isDark ? styles.thumbDark : styles.thumbLight}`} />
        <Sun size={14} className={`${styles.icon} ${styles.iconSun} ${isDark ? '' : styles.iconActive}`} />
        <Moon size={14} className={`${styles.icon} ${styles.iconMoon} ${isDark ? styles.iconActive : ''}`} />
      </span>
    </button>
  );
}
