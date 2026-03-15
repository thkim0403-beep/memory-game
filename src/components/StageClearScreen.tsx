import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Theme } from '../types';
import { formatTime } from '../utils/records';

interface StageClearScreenProps {
  totalAttempts: number;
  totalTime: number;
  theme: Theme;
  onGoToStart: () => void;
}

function getTotalStars(attempts: number): number {
  // Total pairs across 3 stages: 6 + 8 + 10 = 24
  if (attempts <= 36) return 3; // 24 * 1.5
  if (attempts <= 48) return 2; // 24 * 2
  return 1;
}

export default function StageClearScreen({
  totalAttempts,
  totalTime,
  theme,
  onGoToStart,
}: StageClearScreenProps) {
  const stars = getTotalStars(totalAttempts);
  const [visibleStars, setVisibleStars] = useState(0);

  useEffect(() => {
    const timers = Array.from({ length: stars }, (_, i) =>
      setTimeout(() => setVisibleStars(i + 1), 300 + i * 400),
    );
    return () => timers.forEach(clearTimeout);
  }, [stars]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <motion.h1
        className="text-4xl md:text-6xl font-bold mb-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        🏆 전 스테이지 클리어!
      </motion.h1>

      <motion.p
        className="text-xl text-gray-600 dark:text-gray-300 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {theme.icon} {theme.name} 테마 완료!
      </motion.p>

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
        <p>⏱️ 총 시간: <strong>{formatTime(totalTime)}</strong></p>
        <p>🔄 총 시도: <strong>{totalAttempts}회</strong></p>
      </motion.div>

      <motion.button
        onClick={onGoToStart}
        className="bg-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        🏠 처음으로
      </motion.button>
    </div>
  );
}
