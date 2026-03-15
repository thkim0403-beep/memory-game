import { useState, useCallback, useRef, useEffect } from 'react';
import type { CardData, ThemeKey, Difficulty, DifficultyConfig, Theme } from '../types';
import { createCards, checkMatch } from '../utils/gameLogic';
import { themes, difficulties } from '../utils/themes';
import { loadApiTheme, fallbackEmojis } from '../utils/api';
import { playFlip, playMatch, playMismatch, playClear } from '../utils/sounds';

type VsPhase = 'setup' | 'playing' | 'loading' | 'result';

export function useVsGame() {
  const [phase, setPhase] = useState<VsPhase>('setup');
  const [themeKey, setThemeKey] = useState<ThemeKey>('animals');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [matchedAnimIds, setMatchedAnimIds] = useState<Set<string>>(new Set());
  const [shakeAnimIds, setShakeAnimIds] = useState<Set<string>>(new Set());

  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2']);
  const [scores, setScores] = useState([0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchAnimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultPhaseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameGenRef = useRef(0);
  const flippedCountRef = useRef(0);

  const theme: Theme = themes[themeKey];
  const diffConfig: DifficultyConfig = difficulties[difficulty];
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

  const startVsGame = useCallback(
    async (tk: ThemeKey, diff: Difficulty, names: [string, string]) => {
      setThemeKey(tk);
      setDifficulty(diff);
      setPlayerNames(names);
      setFlippedIds([]);
      setIsChecking(false);
      setScores([0, 0]);
      setCurrentPlayer(0);
      setElapsedTime(0);
      setMatchedAnimIds(new Set());
      setShakeAnimIds(new Set());
      flippedCountRef.current = 0;

      const t = themes[tk];
      const d = difficulties[diff];

      if (t.isApi) {
        const gen = ++gameGenRef.current;
        setPhase('loading');
        try {
          const data = await loadApiTheme(tk, d.pairs);
          if (gen !== gameGenRef.current) return;
          setCards(createCards(data.emojis, d.pairs, data.images));
        } catch {
          if (gen !== gameGenRef.current) return;
          const fb = fallbackEmojis[tk] || themes.animals.emojis;
          setCards(createCards(fb, d.pairs));
        }
        setPhase('playing');
      } else {
        setCards(createCards(t.emojis, d.pairs));
        setPhase('playing');
      }
    },
    [],
  );

  const goToSetup = useCallback(() => {
    if (resultPhaseTimeout.current) clearTimeout(resultPhaseTimeout.current);
    if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    if (matchAnimTimer.current) clearTimeout(matchAnimTimer.current);
    setPhase('setup');
  }, []);

  const flipCard = useCallback(
    (id: string) => {
      if (isChecking || flippedCountRef.current >= 2) return;
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

        const first = newCards.find((c) => c.id === newFlipped[0])!;
        const second = newCards.find((c) => c.id === newFlipped[1])!;

        if (checkMatch(first, second)) {
          playMatch();

          if (matchAnimTimer.current) clearTimeout(matchAnimTimer.current);
          setMatchedAnimIds(new Set([first.id, second.id]));
          matchAnimTimer.current = setTimeout(() => setMatchedAnimIds(new Set()), 500);

          const matched = newCards.map((c) =>
            c.id === first.id || c.id === second.id ? { ...c, isMatched: true } : c,
          );
          setCards(matched);
          setFlippedIds([]);
          setIsChecking(false);
          flippedCountRef.current = 0;

          setScores(prev => {
            const next = [...prev];
            next[currentPlayer] += 1;
            if (next[0] + next[1] === totalPairs) {
              if (timerRef.current) clearInterval(timerRef.current);
              playClear();
              if (resultPhaseTimeout.current) clearTimeout(resultPhaseTimeout.current);
              resultPhaseTimeout.current = setTimeout(() => setPhase('result'), 600);
            }
            return next;
          });
          // Same player continues
        } else {
          playMismatch();
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
            setCurrentPlayer((p) => (p === 0 ? 1 : 0));
          }, 1000);
        }
      }
    },
    [cards, flippedIds, isChecking, currentPlayer, totalPairs],
  );

  return {
    phase,
    theme,
    themeKey,
    difficulty,
    diffConfig,
    cards,
    playerNames,
    scores,
    currentPlayer,
    totalPairs,
    elapsedTime,
    matchedAnimIds,
    shakeAnimIds,
    startVsGame,
    goToSetup,
    flipCard,
  };
}
