import { useCallback, useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'dark';

function systemTheme(): ThemeChoice {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(): { theme: ThemeChoice; toggle: () => void } {
  const [theme, setTheme] = useState<ThemeChoice>(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    return attr === 'light' || attr === 'dark' ? attr : systemTheme();
  });
  useEffect(() => {
    // Mirror the active theme for charts; only pin an attribute once the user chooses.
    document.documentElement.dataset.activeTheme = theme;
  }, [theme]);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const n = t === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', n);
      try { localStorage.setItem('theme', n); } catch { /* ignore */ }
      return n;
    });
  }, []);
  return { theme, toggle };
}
