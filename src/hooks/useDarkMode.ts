import { useState, useEffect, useCallback } from 'react';
import { loadDarkMode, saveDarkMode, applyDarkClass } from '../utils/darkMode';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => loadDarkMode());

  useEffect(() => {
    applyDarkClass(isDark);
  }, [isDark]);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      saveDarkMode(next);
      return next;
    });
  }, []);

  return { isDark, toggleDark };
}
