import type { BestRecord, BestRecords, Difficulty, RankingEntry } from '../types';

const STORAGE_KEY = 'memory-game-records';
const RANKING_STORAGE_KEY = 'memory-game-ranking';
const NICKNAME_STORAGE_KEY = 'memory-game-nickname';
const MAX_RANKING_SIZE = 10;

// ── Best records (existing) ──────────────────────────────────

export function loadRecords(): BestRecords {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRecord(difficulty: Difficulty, attempts: number, time: number): boolean {
  const records = loadRecords();
  const prev = records[difficulty];
  let isNew = false;

  if (!prev || attempts < prev.attempts || (attempts === prev.attempts && time < prev.time)) {
    records[difficulty] = { attempts, time };
    isNew = true;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return isNew;
}

export function formatRecord(record: BestRecord | undefined): string {
  if (!record) return '-';
  return `${record.attempts}회 / ${formatTime(record.time)}`;
}

// ── Ranking system ───────────────────────────────────────────

type RankingData = Partial<Record<Difficulty, RankingEntry[]>>;

function loadAllRankings(): RankingData {
  try {
    const raw = localStorage.getItem(RANKING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllRankings(data: RankingData): void {
  localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(data));
}

export function getRanking(difficulty: Difficulty): RankingEntry[] {
  const data = loadAllRankings();
  return data[difficulty] || [];
}

/** Returns the rank (1-based) the new result would achieve, or null if it wouldn't make top 10. */
export function checkRankPosition(
  difficulty: Difficulty,
  attempts: number,
  time: number,
): number | null {
  const list = getRanking(difficulty);

  // Find where the new entry would be inserted
  let pos = list.length; // default: end of list
  for (let i = 0; i < list.length; i++) {
    if (attempts < list[i].attempts || (attempts === list[i].attempts && time < list[i].time)) {
      pos = i;
      break;
    }
  }

  // Rank is 1-based
  const rank = pos + 1;
  return rank <= MAX_RANKING_SIZE ? rank : null;
}

/** Adds a new entry to the ranking and returns its rank (1-based). */
export function addRankingEntry(
  difficulty: Difficulty,
  entry: RankingEntry,
): number {
  const data = loadAllRankings();
  const list = data[difficulty] || [];

  // Find insertion position (sorted by attempts asc, then time asc)
  let pos = list.length;
  for (let i = 0; i < list.length; i++) {
    if (
      entry.attempts < list[i].attempts ||
      (entry.attempts === list[i].attempts && entry.time < list[i].time)
    ) {
      pos = i;
      break;
    }
  }

  list.splice(pos, 0, entry);

  // Keep only top 10
  data[difficulty] = list.slice(0, MAX_RANKING_SIZE);
  saveAllRankings(data);

  return pos + 1; // 1-based rank
}

// ── Nickname persistence ─────────────────────────────────────

export function loadNickname(): string {
  try {
    return localStorage.getItem(NICKNAME_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveNickname(nickname: string): void {
  localStorage.setItem(NICKNAME_STORAGE_KEY, nickname);
}

// ── Formatting helpers ───────────────────────────────────────

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
  } catch {
    return dateStr;
  }
}
