export interface CardData {
  id: string;
  emoji: string;
  image?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type ThemeKey =
  | 'animals' | 'fruits' | 'vehicles' | 'sports' | 'christmas'
  | 'halloween' | 'ocean' | 'music' | 'dinosaur' | 'gems' | 'fairytale' | 'robot' | 'dessert'
  | 'space' | 'toys' | 'school' | 'summer' | 'jobs' | 'circus' | 'rainbow'
  | 'weather' | 'buildings' | 'science' | 'hands' | 'zodiac' | 'family'
  | 'smileys' | 'flags' | 'food' | 'nature' | 'dogs'
  | 'cats' | 'avatars' | 'photos'
  | 'pixel' | 'monsters' | 'lorelei'
  | 'party' | 'travel' | 'camping' | 'farm';

export interface Theme {
  key: ThemeKey;
  name: string;
  icon: string;
  emojis: string[];
  gradient: string;
  gradientFrom: string;
  gradientTo: string;
  isApi?: boolean;
}

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  key: Difficulty;
  label: string;
  icon: string;
  cols: number;
  rows: number;
  pairs: number;
}

export type GamePhase = 'start' | 'playing' | 'clear' | 'stage-intro' | 'stage-clear' | 'loading' | 'ranking' | 'stats' | 'achievements' | 'timeattack';

export type GameMode = 'free' | 'stage' | 'daily';

export interface BestRecord {
  attempts: number;
  time: number;
}

export type BestRecords = Partial<Record<Difficulty, BestRecord>>;

export interface RankingEntry {
  nickname: string;
  attempts: number;
  time: number;
  theme: ThemeKey;
  themeName: string;
  difficulty: Difficulty;
  date: string;
}
