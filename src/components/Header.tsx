import { motion } from 'framer-motion';
import type { Theme } from '../types';
import { formatTime } from '../utils/records';

interface HeaderProps {
  theme: Theme;
  attempts: number;
  matchedPairs: number;
  totalPairs: number;
  elapsedTime: number;
}

export default function Header({
  theme,
  attempts,
  matchedPairs,
  totalPairs,
  elapsedTime,
}: HeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-10 px-3 md:px-6 py-2 md:py-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-md mb-2 md:mb-4 text-base md:text-3xl">
      <div className="flex items-center gap-1">
        <span className="text-xl md:text-3xl">{theme.icon}</span>
        <span className="font-bold">{theme.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="hidden md:inline text-3xl">🔄</span>
        <span>시도:</span>
        <motion.strong
          key={attempts}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          {attempts}
        </motion.strong>
      </div>
      <div className="flex items-center gap-1">
        <span className="hidden md:inline text-3xl">✅</span>
        <span>짝:</span>
        <motion.strong
          key={matchedPairs}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          {matchedPairs}/{totalPairs}
        </motion.strong>
      </div>
      <div className="flex items-center gap-1">
        <span className="hidden md:inline text-3xl">⏱️</span>
        <span>{formatTime(elapsedTime)}</span>
      </div>
    </div>
  );
}
