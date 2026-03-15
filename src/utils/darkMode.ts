const DARK_KEY = 'memory-game-dark';

export function loadDarkMode(): boolean {
  try {
    return localStorage.getItem(DARK_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveDarkMode(value: boolean): void {
  try {
    localStorage.setItem(DARK_KEY, String(value));
  } catch {
    // ignore
  }
}

export function applyDarkClass(isDark: boolean): void {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
