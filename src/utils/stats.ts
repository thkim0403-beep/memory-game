import type { ThemeKey, Difficulty } from '../types';

const STATS_KEY = 'memory-game-stats';

export interface GameStats {
  totalPlays: number;
  totalClears: number;
  themePlays: Partial<Record<ThemeKey, number>>;
  totalAttempts: number;
  totalTime: number;
  /** 클리어한 게임의 시도 횟수만 누적 */
  clearAttempts: number;
}

function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw) as GameStats;
  } catch {
    // ignore
  }
  return {
    totalPlays: 0,
    totalClears: 0,
    themePlays: {},
    totalAttempts: 0,
    totalTime: 0,
    clearAttempts: 0,
  };
}

function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function recordPlay(
  theme: ThemeKey,
  _difficulty: Difficulty,
  attempts: number,
  time: number,
  cleared: boolean,
): void {
  const stats = loadStats();
  stats.totalPlays += 1;
  if (cleared) {
    stats.totalClears += 1;
    stats.clearAttempts = (stats.clearAttempts ?? 0) + attempts;
  }
  stats.themePlays[theme] = (stats.themePlays[theme] || 0) + 1;
  stats.totalAttempts += attempts;
  stats.totalTime += time;
  saveStats(stats);
}

export function getStats(): GameStats {
  return loadStats();
}
