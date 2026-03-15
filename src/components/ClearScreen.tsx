import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Theme } from '../types';
import { formatTime } from '../utils/records';
import { fallbackEmojis } from '../utils/api';
import { getStars } from '../utils/gameLogic';
import NicknameModal from './NicknameModal';

interface ClearScreenProps {
  attempts: number;
  totalPairs: number;
  elapsedTime: number;
  theme: Theme;
  isNewRecord: boolean;
  rankPosition: number | null;
  onRestart: () => void;
  onGoToStart: () => void;
  onNicknameSubmit: (nickname: string) => void;
  onGoToRanking: () => void;
}

interface Particle {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
}

function EmojiRain({ emojis }: { emojis: string[] }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const p: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
    }));
    setParticles(p);
  }, [emojis]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute text-3xl"
          style={{ left: `${p.x}%` }}
          initial={{ y: -50, opacity: 1 }}
          animate={{ y: '100vh', opacity: 0 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}

export default function ClearScreen({
  attempts,
  totalPairs,
  elapsedTime,
  theme,
  isNewRecord,
  rankPosition,
  onRestart,
  onGoToStart,
  onNicknameSubmit,
  onGoToRanking,
}: ClearScreenProps) {
  const stars = getStars(attempts, totalPairs);
  const [visibleStars, setVisibleStars] = useState(0);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [savedRank, setSavedRank] = useState<number | null>(null);

  useEffect(() => {
    const timers = Array.from({ length: stars }, (_, i) =>
      setTimeout(() => setVisibleStars(i + 1), 300 + i * 400),
    );
    return () => timers.forEach(clearTimeout);
  }, [stars]);

  // Show nickname modal after a delay if ranked
  useEffect(() => {
    if (rankPosition !== null && savedRank === null) {
      const timer = setTimeout(() => {
        setShowNicknameModal(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [rankPosition, savedRank]);

  const handleNicknameSubmit = (nickname: string) => {
    setShowNicknameModal(false);
    setSavedRank(rankPosition);
    onNicknameSubmit(nickname);
  };

  return (
    <>
      <EmojiRain
        emojis={
          theme.emojis.length > 0
            ? theme.emojis.slice(0, 8)
            : fallbackEmojis[theme.key] || ['🎉', '🥳', '🎊', '✨', '💫', '⭐', '🌟', '🏆']
        }
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          🎉 축하해요!
        </motion.h1>

        {isNewRecord && (
          <motion.div
            className="text-2xl font-bold text-yellow-500 mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            🏆 새 기록!
          </motion.div>
        )}

        {/* Rank display */}
        {(rankPosition !== null || savedRank !== null) && (
          <motion.div
            className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-3 bg-yellow-100 dark:bg-yellow-900/40 px-8 py-3 rounded-2xl shadow-md"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.4 }}
          >
            <motion.span
              animate={{ rotate: [0, -15, 15, -15, 0] }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="inline-block mr-2"
            >
              🏆
            </motion.span>
            {savedRank ?? rankPosition}위!
          </motion.div>
        )}

        <div className="text-5xl mb-4 flex gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <AnimatePresence key={i}>
              {i < visibleStars ? (
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                >
                  ⭐
                </motion.span>
              ) : (
                <span className="opacity-30">☆</span>
              )}
            </AnimatePresence>
          ))}
        </div>

        <motion.div
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-lg mb-6 text-lg space-y-2 dark:text-gray-100"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>⏱️ 걸린 시간: <strong>{formatTime(elapsedTime)}</strong></p>
          <p>🔄 시도 횟수: <strong>{attempts}회</strong></p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={onRestart}
            className="bg-purple-500 text-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-purple-600 transition-all duration-200 shadow-lg hover:scale-105"
          >
            🔄 다시 하기
          </button>
          <button
            onClick={onGoToRanking}
            className="bg-yellow-400 text-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-yellow-500 transition-all duration-200 shadow-lg hover:scale-105"
          >
            🏆 랭킹 보기
          </button>
          <button
            onClick={onGoToStart}
            className="bg-white/80 dark:bg-gray-700 dark:text-gray-100 px-6 py-3 rounded-xl font-bold text-lg hover:bg-white dark:hover:bg-gray-600 transition-all duration-200 shadow-lg hover:scale-105"
          >
            🏠 처음으로
          </button>
        </motion.div>
      </div>

      <NicknameModal
        rank={rankPosition ?? 0}
        open={showNicknameModal}
        onSubmit={handleNicknameSubmit}
      />
    </>
  );
}
