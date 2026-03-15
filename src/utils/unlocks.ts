import type { ThemeKey } from '../types';
import { themeKeys } from '../utils/themes';

const UNLOCK_STORAGE_KEY = 'memory-game-unlocked-themes';

/** 기본 해금 테마 (처음부터 사용 가능) */
const DEFAULT_UNLOCKED: ThemeKey[] = ['animals', 'fruits', 'vehicles', 'sports', 'christmas', 'pixel', 'monsters'];

/** 해금 가능한 테마 순서 (기본 해금 제외, themeKeys 순서대로) */
const LOCKABLE_THEMES: ThemeKey[] = themeKeys.filter(
  (k) => !DEFAULT_UNLOCKED.includes(k),
);

/** 해금된 테마 목록 로드 */
function loadUnlocked(): ThemeKey[] {
  try {
    const raw = localStorage.getItem(UNLOCK_STORAGE_KEY);
    if (!raw) return [...DEFAULT_UNLOCKED];
    const parsed: ThemeKey[] = JSON.parse(raw);
    // 기본 해금 테마는 항상 포함
    const set = new Set<ThemeKey>(parsed);
    for (const k of DEFAULT_UNLOCKED) set.add(k);
    return Array.from(set);
  } catch {
    return [...DEFAULT_UNLOCKED];
  }
}

/** 해금된 테마 목록 저장 */
function saveUnlocked(unlocked: ThemeKey[]): void {
  localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(unlocked));
}

/** 현재 해금된 테마 목록 반환 */
export function getUnlockedThemes(): ThemeKey[] {
  return loadUnlocked();
}

/** 해금된 테마 수 반환 */
export function getUnlockedCount(): number {
  return loadUnlocked().length;
}

/** 전체 테마 수 반환 */
export function getTotalThemeCount(): number {
  return themeKeys.length;
}

/**
 * 다음 테마 1개 해금
 * @returns 해금된 테마 키, 또는 모두 해금된 경우 null
 */
export function unlockNextTheme(): ThemeKey | null {
  const unlocked = loadUnlocked();
  const unlockedSet = new Set(unlocked);

  // 잠금 가능한 테마 중 아직 해금 안 된 첫 번째 테마
  const next = LOCKABLE_THEMES.find((k) => !unlockedSet.has(k));
  if (!next) return null; // 모두 해금됨

  unlocked.push(next);
  saveUnlocked(unlocked);
  return next;
}

/** 특정 테마가 잠겨 있는지 확인 */
export function isThemeLocked(themeKey: ThemeKey): boolean {
  const unlocked = loadUnlocked();
  return !unlocked.includes(themeKey);
}

/** 모든 테마가 해금되었는지 확인 */
export function isAllUnlocked(): boolean {
  return loadUnlocked().length >= themeKeys.length;
}

/** 특정 잠긴 테마를 해금하려면 몇 번 더 클리어해야 하는지 반환 */
export function getClearsToUnlock(themeKey: ThemeKey): number {
  if (!isThemeLocked(themeKey)) return 0;
  const unlocked = loadUnlocked();
  const unlockedSet = new Set(unlocked);
  const idx = LOCKABLE_THEMES.indexOf(themeKey);
  if (idx === -1) return 0;
  const alreadyUnlockedLockable = LOCKABLE_THEMES.filter((k) => unlockedSet.has(k)).length;
  return idx + 1 - alreadyUnlockedLockable;
}

/** 해금 상태 초기화 (디버그/테스트용) */
export function resetUnlocks(): void {
  localStorage.removeItem(UNLOCK_STORAGE_KEY);
}
