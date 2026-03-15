import { useState, useCallback, useRef, useEffect } from 'react';
import type { CardData, ThemeKey, Difficulty, GamePhase, GameMode, RankingEntry } from '../types';
import { createCards, checkMatch, getStars } from '../utils/gameLogic';
import { themes, difficulties, STAGE_ORDER } from '../utils/themes';
import { saveRecord, loadRecords, checkRankPosition, addRankingEntry, saveNickname } from '../utils/records';
import { loadApiTheme, fallbackEmojis } from '../utils/api';
import { playFlip, playMatch, playMismatch, playClear, playCombo } from '../utils/sounds';
import { recordPlay, getStats } from '../utils/stats';
import { unlockNextTheme } from '../utils/unlocks';
import { checkAchievements } from '../utils/achievements';
import type { Achievement } from '../utils/achievements';
import { completeDailyChallenge, getDailyChallenge } from '../utils/dailyChallenge';

const HINT_LIMITS: Record<Difficulty, number> = { easy: 3, normal: 2, hard: 1 };

const ENCOURAGEMENTS = [
  '멋져요! 👏', '대단해! 🌟', '천재! 🧠', '최고! 🏆',
  '잘했어! ✨', '굿! 👍', '와우! 🎉', '짱! 💪',
];

function randomEncouragement(): string {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

export function useGame() {
  const [phase, setPhase] = useState<GamePhase>('start');
  const [mode, setMode] = useState<GameMode>('free');
  const [themeKey, setThemeKey] = useState<ThemeKey>('animals');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [matchedAnimIds, setMatchedAnimIds] = useState<Set<string>>(new Set());
  const [shakeAnimIds, setShakeAnimIds] = useState<Set<string>>(new Set());

  const [combo, setCombo] = useState(0);
  const [comboPopup, setComboPopup] = useState<number | null>(null);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [hintsLeft, setHintsLeft] = useState(2);
  const [hintIds, setHintIds] = useState<Set<string>>(new Set());
  const [stageIndex, setStageIndex] = useState(0);
  const [stageTotalAttempts, setStageTotalAttempts] = useState(0);
  const [stageTotalTime, setStageTotalTime] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Ranking state
  const [rankPosition, setRankPosition] = useState<number | null>(null);
  const [rankHighlight, setRankHighlight] = useState<{ difficulty: Difficulty; rank: number } | null>(null);

  // Achievement state
  const [achievementPopup, setAchievementPopup] = useState<Achievement[]>([]);
  const maxComboRef = useRef(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchAnimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearPhaseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const encourageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameGenRef = useRef(0);
  const flippedCountRef = useRef(0);

  const theme = themes[themeKey];
  const diffConfig = difficulties[difficulty];
  const totalPairs = diffConfig.pairs;

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsedTime((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const resetGameState = useCallback((diff: Difficulty) => {
    setFlippedIds([]);
    setIsChecking(false);
    setAttempts(0);
    setMatchedPairs(0);
    setElapsedTime(0);
    setMatchedAnimIds(new Set());
    setShakeAnimIds(new Set());
    setCombo(0);
    setComboPopup(null);
    setEncouragement(null);
    setHintsLeft(HINT_LIMITS[diff]);
    setHintIds(new Set());
    setIsNewRecord(false);
    setRankPosition(null);
    maxComboRef.current = 0;
    flippedCountRef.current = 0;
    setAchievementPopup([]);
  }, []);

  const initGame = useCallback(
    async (tk: ThemeKey, diff: Difficulty) => {
      setThemeKey(tk);
      setDifficulty(diff);
      resetGameState(diff);

      const t = themes[tk];
      const d = difficulties[diff];

      if (t.isApi) {
        const gen = ++gameGenRef.current;
        setPhase('loading');
        try {
          const data = await loadApiTheme(tk, d.pairs);
          if (gen !== gameGenRef.current) return; // stale request, discard
          setCards(createCards(data.emojis, d.pairs, data.images));
        } catch {
          if (gen !== gameGenRef.current) return; // stale request, discard
          const fb = fallbackEmojis[tk] || themes.animals.emojis;
          setCards(createCards(fb, d.pairs));
        }
      } else {
        setCards(createCards(t.emojis, d.pairs));
      }
    },
    [resetGameState],
  );

  const startGame = useCallback(
    async (selectedTheme: ThemeKey, selectedDifficulty: Difficulty, gameMode: GameMode = 'free') => {
      setMode(gameMode);
      await initGame(selectedTheme, selectedDifficulty);
      setPhase('playing');
    },
    [initGame],
  );

  const startStageMode = useCallback(
    async (selectedTheme: ThemeKey) => {
      setMode('stage');
      setStageIndex(0);
      setStageTotalAttempts(0);
      setStageTotalTime(0);
      setThemeKey(selectedTheme);
      const diff = STAGE_ORDER[0];
      await initGame(selectedTheme, diff);
      setPhase('stage-intro');
    },
    [initGame],
  );

  const beginStage = useCallback(() => {
    setPhase('playing');
  }, []);

  const restart = useCallback(async () => {
    await initGame(themeKey, difficulty);
    setPhase('playing');
  }, [initGame, themeKey, difficulty]);

  const goToStart = useCallback(() => {
    if (clearPhaseTimeout.current) clearTimeout(clearPhaseTimeout.current);
    if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    if (hintTimeout.current) clearTimeout(hintTimeout.current);
    if (matchAnimTimer.current) clearTimeout(matchAnimTimer.current);
    if (comboTimer.current) clearTimeout(comboTimer.current);
    if (encourageTimer.current) clearTimeout(encourageTimer.current);
    setRankHighlight(null);
    setPhase('start');
  }, []);

  const goToRanking = useCallback(() => {
    setPhase('ranking');
  }, []);

  const goToStats = useCallback(() => {
    setPhase('stats');
  }, []);

  const goToAchievements = useCallback(() => {
    setPhase('achievements');
  }, []);

  const goToRankingFromClear = useCallback(() => {
    // Keep the highlight info if we have it
    setPhase('ranking');
  }, []);

  const handleNicknameSubmit = useCallback((nickname: string) => {
    saveNickname(nickname);
    const entry: RankingEntry = {
      nickname,
      attempts,
      time: elapsedTime,
      theme: themeKey,
      themeName: themes[themeKey].name,
      difficulty,
      date: new Date().toISOString(),
    };
    const rank = addRankingEntry(difficulty, entry);
    setRankHighlight({ difficulty, rank });
  }, [attempts, elapsedTime, themeKey, difficulty]);

  const useHint = useCallback(() => {
    if (hintsLeft <= 0 || isChecking) return;
    const unmatched = cards.filter((c) => !c.isMatched && !c.isFlipped);
    if (unmatched.length < 2) return;

    const emojiMap = new Map<string, CardData[]>();
    for (const c of unmatched) {
      const list = emojiMap.get(c.emoji) || [];
      list.push(c);
      emojiMap.set(c.emoji, list);
    }
    let pair: CardData[] | undefined;
    for (const list of emojiMap.values()) {
      if (list.length >= 2) {
        pair = list.slice(0, 2);
        break;
      }
    }
    if (!pair) return;

    const ids = new Set([pair[0].id, pair[1].id]);
    setHintIds(ids);
    setHintsLeft((h) => h - 1);
    setCards((prev) =>
      prev.map((c) => (ids.has(c.id) ? { ...c, isFlipped: true } : c)),
    );
    if (hintTimeout.current) clearTimeout(hintTimeout.current);
    hintTimeout.current = setTimeout(() => {
      setCards((prev) =>
        prev.map((c) =>
          ids.has(c.id) && !c.isMatched ? { ...c, isFlipped: false } : c,
        ),
      );
      setHintIds(new Set());
    }, 1500);
  }, [cards, hintsLeft, isChecking]);

  const handleClear = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    playClear();

    // Unlock next theme on any clear
    unlockNextTheme();

    if (mode === 'free' || mode === 'daily') {
      const isNew = saveRecord(difficulty, attempts + 1, elapsedTime);
      setIsNewRecord(isNew);
      recordPlay(themeKey, difficulty, attempts + 1, elapsedTime, true);

      // Save daily challenge result
      if (mode === 'daily') {
        const daily = getDailyChallenge();
        completeDailyChallenge(daily.dateStr, attempts + 1, elapsedTime);
      }

      // Check ranking position (using attempts + 1 because handleClear is called before the last setAttempts)
      const rank = checkRankPosition(difficulty, attempts + 1, elapsedTime);
      setRankPosition(rank);

      // Derive clearedDifficulties from saved records
      const records = loadRecords();
      const clearedDifficulties = (Object.keys(records) as (keyof typeof records)[]).filter(
        (d) => records[d] !== undefined,
      );

      // Check achievements
      const stats = getStats();
      const uniqueThemesPlayed = Object.keys(stats.themePlays).length;
      const newAchievements = checkAchievements({
        justCleared: true,
        attempts: attempts + 1,
        totalPairs,
        maxCombo: maxComboRef.current,
        stars: getStars(attempts + 1, totalPairs),
        clearedDifficulties,
        rankPosition: rank,
        elapsedTime,
        uniqueThemesPlayed,
      });
      if (newAchievements.length > 0) {
        setAchievementPopup(newAchievements);
      }

      if (clearPhaseTimeout.current) clearTimeout(clearPhaseTimeout.current);
      clearPhaseTimeout.current = setTimeout(() => setPhase('clear'), 600);
    } else {
      const newTotalAttempts = stageTotalAttempts + attempts + 1;
      const newTotalTime = stageTotalTime + elapsedTime;
      setStageTotalAttempts(newTotalAttempts);
      setStageTotalTime(newTotalTime);

      // Record stats for each stage clear
      const stageDiff = STAGE_ORDER[stageIndex];
      recordPlay(themeKey, stageDiff, attempts + 1, elapsedTime, true);

      if (stageIndex >= STAGE_ORDER.length - 1) {
        // Last stage: check achievements once
        const records = loadRecords();
        const clearedDifficulties = (Object.keys(records) as (keyof typeof records)[]).filter(
          (d) => records[d] !== undefined,
        );
        const stats = getStats();
        const uniqueThemesPlayed = Object.keys(stats.themePlays).length;
        const cumulativePairs = STAGE_ORDER.reduce((sum, d) => sum + difficulties[d].pairs, 0);
        const newAchievements = checkAchievements({
          justCleared: true,
          attempts: newTotalAttempts,
          totalPairs: cumulativePairs,
          maxCombo: maxComboRef.current,
          stars: getStars(newTotalAttempts, cumulativePairs),
          clearedDifficulties,
          rankPosition: null,
          elapsedTime: newTotalTime,
          uniqueThemesPlayed,
        });
        if (newAchievements.length > 0) {
          setAchievementPopup(newAchievements);
        }
        if (clearPhaseTimeout.current) clearTimeout(clearPhaseTimeout.current);
        clearPhaseTimeout.current = setTimeout(() => setPhase('stage-clear'), 600);
      } else {
        const nextIdx = stageIndex + 1;
        setStageIndex(nextIdx);
        if (clearPhaseTimeout.current) clearTimeout(clearPhaseTimeout.current);
        clearPhaseTimeout.current = setTimeout(async () => {
          const diff = STAGE_ORDER[nextIdx];
          await initGame(themeKey, diff);
          setPhase('stage-intro');
        }, 800);
      }
    }
  }, [mode, difficulty, attempts, elapsedTime, stageIndex, stageTotalAttempts, stageTotalTime, themeKey, initGame, totalPairs]);

  const flipCard = useCallback(
    (id: string) => {
      if (isChecking || hintIds.size > 0 || flippedCountRef.current >= 2) return;
      const card = cards.find((c) => c.id === id);
      if (!card || card.isMatched || card.isFlipped) return;

      flippedCountRef.current++;
      playFlip();

      const newCards = cards.map((c) =>
        c.id === id ? { ...c, isFlipped: true } : c,
      );
      const newFlipped = [...flippedIds, id];
      setCards(newCards);
      setFlippedIds(newFlipped);

      if (newFlipped.length === 2) {
        setIsChecking(true);
        setAttempts((a) => a + 1);

        const first = newCards.find((c) => c.id === newFlipped[0])!;
        const second = newCards.find((c) => c.id === newFlipped[1])!;

        if (checkMatch(first, second)) {
          playMatch();

          if (matchAnimTimer.current) clearTimeout(matchAnimTimer.current);
          setMatchedAnimIds(new Set([first.id, second.id]));
          matchAnimTimer.current = setTimeout(() => setMatchedAnimIds(new Set()), 500);

          // 격려 메시지
          if (encourageTimer.current) clearTimeout(encourageTimer.current);
          setEncouragement(randomEncouragement());
          encourageTimer.current = setTimeout(() => setEncouragement(null), 1200);

          setCombo((prev) => {
            const next = prev + 1;
            if (next >= 2) {
              playCombo();
              if (comboTimer.current) clearTimeout(comboTimer.current);
              setComboPopup(next);
              comboTimer.current = setTimeout(() => setComboPopup(null), 1200);
            }
            maxComboRef.current = Math.max(maxComboRef.current, next);
            return next;
          });

          const matched = newCards.map((c) =>
            c.id === first.id || c.id === second.id ? { ...c, isMatched: true } : c,
          );
          setCards(matched);
          setFlippedIds([]);
          setIsChecking(false);
          flippedCountRef.current = 0;
          setMatchedPairs((m) => {
            const next = m + 1;
            if (next === totalPairs) handleClear();
            return next;
          });
        } else {
          playMismatch();
          setCombo(0);
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
            flippedCountRef.current = 0;
          }, 1000);
        }
      }
    },
    [cards, flippedIds, isChecking, totalPairs, hintIds, handleClear],
  );

  return {
    phase,
    mode,
    theme,
    themeKey,
    difficulty,
    diffConfig,
    cards,
    attempts,
    matchedPairs,
    totalPairs,
    elapsedTime,
    matchedAnimIds,
    shakeAnimIds,
    combo,
    comboPopup,
    encouragement,
    hintsLeft,
    hintIds,
    stageIndex,
    stageTotalAttempts,
    stageTotalTime,
    isNewRecord,
    rankPosition,
    rankHighlight,
    achievementPopup,
    setAchievementPopup,
    startGame,
    startStageMode,
    beginStage,
    restart,
    goToStart,
    goToRanking,
    goToStats,
    goToAchievements,
    goToRankingFromClear,
    handleNicknameSubmit,
    flipCard,
    useHint,
  };
}
