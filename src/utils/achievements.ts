import type { Difficulty } from '../types';
import { getUnlockedCount } from '../utils/unlocks';

const ACHIEVEMENTS_STORAGE_KEY = 'memory-game-achievements';

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  achieved: boolean;
  achievedAt?: string;
}

export interface AchievementCheckContext {
  /** 방금 게임 클리어했는지 */
  justCleared?: boolean;
  /** 시도 횟수 */
  attempts?: number;
  /** 총 쌍 수 */
  totalPairs?: number;
  /** 최대 콤보 */
  maxCombo?: number;
  /** 별 개수 (1~3) */
  stars?: number;
  /** 랭킹 순위 (1-based, null이면 랭킹 밖) */
  rankPosition?: number | null;
  /** 클리어 시간 (초) */
  elapsedTime?: number;
  /** 플레이한 고유 테마 수 */
  uniqueThemesPlayed?: number;
  /** 클리어한 난이도 목록 */
  clearedDifficulties?: Difficulty[];
  /** 해금된 테마 수 */
  unlockedThemeCount?: number;
}

/** 업적 정의 */
const ACHIEVEMENT_DEFS: Omit<Achievement, 'achieved' | 'achievedAt'>[] = [
  {
    id: 'first_clear',
    icon: '🎮',
    name: '첫 클리어',
    description: '첫 게임 클리어',
  },
  {
    id: 'combo_master',
    icon: '🔥',
    name: '콤보 마스터',
    description: '3콤보 이상 달성',
  },
  {
    id: 'star_collector',
    icon: '⭐',
    name: '별 수집가',
    description: '별 3개 획득',
  },
  {
    id: 'ranking_entry',
    icon: '🏆',
    name: '랭킹 입성',
    description: '랭킹 TOP 10 진입',
  },
  {
    id: 'perfect_memory',
    icon: '🎯',
    name: '완벽한 기억력',
    description: '최소 시도로 클리어 (시도 횟수 = 쌍 수)',
  },
  {
    id: 'theme_explorer',
    icon: '🌈',
    name: '테마 탐험가',
    description: '10개 테마 플레이',
  },
  {
    id: 'legend_challenger',
    icon: '👑',
    name: '전설의 도전자',
    description: '모든 난이도 클리어',
  },
  {
    id: 'speed_runner',
    icon: '⚡',
    name: '스피드 러너',
    description: '30초 이내 클리어',
  },
  {
    id: 'collector',
    icon: '🔓',
    name: '수집가',
    description: '20개 테마 해금',
  },
  {
    id: 'grand_master',
    icon: '🏅',
    name: '그랜드 마스터',
    description: '모든 업적 달성',
  },
];

/** localStorage에서 달성 상태 로드 */
function loadAchievementState(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** localStorage에 달성 상태 저장 */
function saveAchievementState(state: Record<string, string>): void {
  localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(state));
}

/** 전체 업적 상태 반환 */
export function getAchievements(): Achievement[] {
  const state = loadAchievementState();
  return ACHIEVEMENT_DEFS.map((def) => ({
    ...def,
    achieved: def.id in state,
    achievedAt: state[def.id],
  }));
}

/** 달성률 반환 (0~1) */
export function getAchievementProgress(): number {
  const achievements = getAchievements();
  const achieved = achievements.filter((a) => a.achieved).length;
  return achieved / achievements.length;
}

/** 달성한 업적 수 반환 */
export function getAchievedCount(): number {
  return getAchievements().filter((a) => a.achieved).length;
}

/** 전체 업적 수 반환 */
export function getTotalAchievementCount(): number {
  return ACHIEVEMENT_DEFS.length;
}

/**
 * 업적 달성 조건 확인 후 새로 달성된 업적 반환
 */
export function checkAchievements(context: AchievementCheckContext): Achievement[] {
  const state = loadAchievementState();
  const newlyAchieved: Achievement[] = [];
  const now = new Date().toISOString();

  function achieve(id: string) {
    if (!(id in state)) {
      state[id] = now;
      const def = ACHIEVEMENT_DEFS.find((d) => d.id === id);
      if (def) {
        newlyAchieved.push({ ...def, achieved: true, achievedAt: now });
      }
    }
  }

  // 첫 클리어
  if (context.justCleared) {
    achieve('first_clear');
  }

  // 콤보 마스터: 3콤보 이상
  if (context.maxCombo !== undefined && context.maxCombo >= 3) {
    achieve('combo_master');
  }

  // 별 수집가: 별 3개
  if (context.stars !== undefined && context.stars >= 3) {
    achieve('star_collector');
  }

  // 랭킹 입성: TOP 10
  if (context.rankPosition !== undefined && context.rankPosition !== null && context.rankPosition <= 10) {
    achieve('ranking_entry');
  }

  // 완벽한 기억력: attempts === totalPairs
  if (
    context.justCleared &&
    context.attempts !== undefined &&
    context.totalPairs !== undefined &&
    context.attempts === context.totalPairs
  ) {
    achieve('perfect_memory');
  }

  // 테마 탐험가: 10개 테마 플레이
  if (context.uniqueThemesPlayed !== undefined && context.uniqueThemesPlayed >= 10) {
    achieve('theme_explorer');
  }

  // 전설의 도전자: 모든 난이도 클리어
  if (context.clearedDifficulties) {
    const allDiffs: Difficulty[] = ['easy', 'normal', 'hard'];
    const hasAll = allDiffs.every((d) => context.clearedDifficulties!.includes(d));
    if (hasAll) {
      achieve('legend_challenger');
    }
  }

  // 스피드 러너: 30초 이내 클리어
  if (context.justCleared && context.elapsedTime !== undefined && context.elapsedTime <= 30) {
    achieve('speed_runner');
  }

  // 수집가: 20개 테마 해금
  const unlockedCount = context.unlockedThemeCount ?? getUnlockedCount();
  if (unlockedCount >= 20) {
    achieve('collector');
  }

  // 그랜드 마스터: 모든 업적 달성 (이 업적 제외 나머지 9개)
  const totalOther = ACHIEVEMENT_DEFS.length - 1; // grand_master 제외
  const achievedOther = ACHIEVEMENT_DEFS.filter(
    (d) => d.id !== 'grand_master' && d.id in state,
  ).length;
  if (achievedOther >= totalOther) {
    achieve('grand_master');
  }

  if (newlyAchieved.length > 0) {
    saveAchievementState(state);
  }

  return newlyAchieved;
}

/** 업적 상태 초기화 (디버그/테스트용) */
export function resetAchievements(): void {
  localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
}
