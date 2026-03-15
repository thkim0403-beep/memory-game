import type { ThemeKey, Difficulty } from '../types';
import { staticThemeKeys } from '../utils/themes';

const DAILY_CHALLENGE_STORAGE_KEY = 'memory-game-daily-challenge';

/** 날짜 기반 시드 생성 (간단한 해시) */
function dateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const ch = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash);
}

/** 시드 기반 의사 난수 생성 (0~max-1) */
function seededRandom(seed: number, max: number): number {
  // 간단한 LCG
  const next = (seed * 1103515245 + 12345) & 0x7fffffff;
  return next % max;
}

export interface DailyChallenge {
  theme: ThemeKey;
  difficulty: Difficulty;
  seed: number;
  dateStr: string;
}

export interface DailyChallengeResult {
  dateStr: string;
  attempts: number;
  time: number;
  completedAt: string;
}

/** 오늘 날짜 문자열 (YYYY-MM-DD) */
function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 오늘의 도전 정보 반환 (매일 고정, 모두에게 동일) */
export function getDailyChallenge(): DailyChallenge {
  const dateStr = getTodayStr();
  const seed = dateSeed(dateStr);

  // 시드 기반으로 테마와 난이도 결정 (static 테마만 사용 - API 테마는 제외)
  const themeIndex = seededRandom(seed, staticThemeKeys.length);
  const theme = staticThemeKeys[themeIndex];

  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];
  const diffIndex = seededRandom(seed + 1, difficulties.length);
  const difficulty = difficulties[diffIndex];

  return { theme, difficulty, seed, dateStr };
}

/** 일일 도전 결과 로드 */
function loadDailyChallengeResults(): Record<string, DailyChallengeResult> {
  try {
    const raw = localStorage.getItem(DAILY_CHALLENGE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** 오늘의 도전 완료 여부 확인 */
export function isDailyChallengeCompleted(dateStr?: string): boolean {
  const target = dateStr ?? getTodayStr();
  const results = loadDailyChallengeResults();
  return target in results;
}

/** 일일 도전 결과 저장 */
export function completeDailyChallenge(
  dateStr: string,
  attempts: number,
  time: number,
): void {
  const results = loadDailyChallengeResults();
  results[dateStr] = {
    dateStr,
    attempts,
    time,
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(DAILY_CHALLENGE_STORAGE_KEY, JSON.stringify(results));
}

/** 특정 날짜의 도전 결과 조회 */
export function getDailyChallengeResult(dateStr?: string): DailyChallengeResult | null {
  const target = dateStr ?? getTodayStr();
  const results = loadDailyChallengeResults();
  return results[target] ?? null;
}
