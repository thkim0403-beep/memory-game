import { useState, useCallback, useRef, useEffect } from 'react';
import type { CardData, ThemeKey, Difficulty } from '../types';
import { createCards, checkMatch } from '../utils/gameLogic';
import { themes, difficulties } from '../utils/themes';
import { loadApiTheme, fallbackEmojis } from '../utils/api';
import { playFlip, playMatch, playMismatch, playClear, playCombo } from '../utils/sounds';

/**
 * 타임어택 모드 전용 훅
 *
 * phase:
 *   'setup'   – 테마 + 난이도 선택
 *   'loading' – API 테마 로딩 중
 *   'playing' – 게임 진행 중
 *   'clear'   – 시간 내 클리어
 *   'timeout' – 시간 초과
 */
export type TimeAttackPhase = 'setup' | 'loading' | 'playing' | 'clear' | 'timeout';

/** 난이도별 제한 시간 (초) */
const TIME_LIMITS: Record<Difficulty, number> = {
  easy: 60,
  normal: 90,
  hard: 120,
};

/** 남은 시간 1초당 보너스 점수 */
const BONUS_PER_SECOND = 10;

export interface TimeAttackResult {
  cleared: boolean;
  attempts: number;
  totalPairs: number;
  timeLimit: number;
  remainingTime: number;
  bonusScore: number;
  totalScore: number;
}

export function useTimeAttack() {
  const [phase, setPhase] = useState<TimeAttackPhase>('setup');
  const [themeKey, setThemeKey] = useState<ThemeKey>('animals');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [matchedAnimIds, setMatchedAnimIds] = useState<Set<string>>(new Set());
  const [shakeAnimIds, setShakeAnimIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<TimeAttackResult | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchAnimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearPhaseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const comboRef = useRef(0);

  const theme = themes[themeKey];
  const diffConfig = difficulties[difficulty];
  const totalPairs = diffConfig.pairs;
  const timeLimit = TIME_LIMITS[difficulty];

  // 카운트다운 타이머
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            // 시간 초과
            if (timerRef.current) clearInterval(timerRef.current);
            setResult({
              cleared: false,
              attempts: attemptsRef.current,
              totalPairs,
              timeLimit,
              remainingTime: 0,
              bonusScore: 0,
              totalScore: 0,
            });
            setPhase('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, totalPairs, timeLimit]);

  const startTimeAttack = useCallback(
    async (selectedTheme: ThemeKey, selectedDifficulty: Difficulty) => {
      setThemeKey(selectedTheme);
      setDifficulty(selectedDifficulty);
      setFlippedIds([]);
      setIsChecking(false);
      setAttempts(0);
      attemptsRef.current = 0;
      comboRef.current = 0;
      setMatchedPairs(0);
      setMatchedAnimIds(new Set());
      setShakeAnimIds(new Set());
      setResult(null);

      const t = themes[selectedTheme];
      const d = difficulties[selectedDifficulty];
      const limit = TIME_LIMITS[selectedDifficulty];
      setRemainingTime(limit);

      if (t.isApi) {
        setPhase('loading');
        try {
          const data = await loadApiTheme(selectedTheme, d.pairs);
          setCards(createCards(data.emojis, d.pairs, data.images));
        } catch {
          const fb = fallbackEmojis[selectedTheme] || themes.animals.emojis;
          setCards(createCards(fb, d.pairs));
        }
      } else {
        setCards(createCards(t.emojis, d.pairs));
      }

      setPhase('playing');
    },
    [],
  );

  const handleClear = useCallback(
    (finalAttempts: number) => {
      if (timerRef.current) clearInterval(timerRef.current);
      playClear();

      // remainingTime 은 state 에서 직접 읽음
      setRemainingTime((currentRemaining) => {
        const bonus = currentRemaining * BONUS_PER_SECOND;
        const baseScore = totalPairs * 100;
        const attemptPenalty = Math.max(0, (finalAttempts - totalPairs) * 20);
        const total = baseScore + bonus - attemptPenalty;

        setResult({
          cleared: true,
          attempts: finalAttempts,
          totalPairs,
          timeLimit,
          remainingTime: currentRemaining,
          bonusScore: bonus,
          totalScore: Math.max(0, total),
        });

        return currentRemaining;
      });

      if (clearPhaseTimeout.current) clearTimeout(clearPhaseTimeout.current);
      clearPhaseTimeout.current = setTimeout(() => setPhase('clear'), 600);
    },
    [totalPairs, timeLimit],
  );

  const flipCard = useCallback(
    (id: string) => {
      if (isChecking) return;
      const card = cards.find((c) => c.id === id);
      if (!card || card.isMatched || card.isFlipped) return;

      playFlip();

      const newCards = cards.map((c) =>
        c.id === id ? { ...c, isFlipped: true } : c,
      );
      const newFlipped = [...flippedIds, id];
      setCards(newCards);
      setFlippedIds(newFlipped);

      if (newFlipped.length === 2) {
        setIsChecking(true);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        attemptsRef.current = newAttempts;

        const first = newCards.find((c) => c.id === newFlipped[0])!;
        const second = newCards.find((c) => c.id === newFlipped[1])!;

        if (checkMatch(first, second)) {
          playMatch();
          comboRef.current += 1;
          if (comboRef.current >= 2) {
            playCombo();
          }

          if (matchAnimTimer.current) clearTimeout(matchAnimTimer.current);
          setMatchedAnimIds(new Set([first.id, second.id]));
          matchAnimTimer.current = setTimeout(() => setMatchedAnimIds(new Set()), 500);

          const matched = newCards.map((c) =>
            c.id === first.id || c.id === second.id ? { ...c, isMatched: true } : c,
          );
          setCards(matched);
          setFlippedIds([]);
          setIsChecking(false);
          setMatchedPairs((m) => {
            const next = m + 1;
            if (next === totalPairs) handleClear(newAttempts);
            return next;
          });
        } else {
          playMismatch();
          comboRef.current = 0;
          setShakeAnimIds(new Set([first.id, second.id]));
          if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
          shakeTimeout.current = setTimeout(() => {
            setShakeAnimIds(new Set());
            setCards((prev) =>
              prev.map((c) =>
                c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c,
              ),
            );
            setFlippedIds([]);
            setIsChecking(false);
          }, 1000);
        }
      }
    },
    [cards, flippedIds, isChecking, totalPairs, attempts, handleClear],
  );

  const goToSetup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (matchAnimTimer.current) clearTimeout(matchAnimTimer.current);
    if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    if (clearPhaseTimeout.current) clearTimeout(clearPhaseTimeout.current);
    setPhase('setup');
  }, []);

  return {
    phase,
    theme,
    themeKey,
    difficulty,
    diffConfig,
    cards,
    attempts,
    matchedPairs,
    totalPairs,
    remainingTime,
    timeLimit,
    matchedAnimIds,
    shakeAnimIds,
    result,
    startTimeAttack,
    flipCard,
    goToSetup,
  };
}
