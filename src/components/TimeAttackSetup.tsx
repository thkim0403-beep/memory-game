import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ThemeKey, Difficulty } from '../types';
import { difficulties } from '../utils/themes';
import { TIME_LIMITS } from '../hooks/useTimeAttack';
import ThemeSelector from './ThemeSelector';

interface TimeAttackSetupProps {
  onStart: (theme: ThemeKey, difficulty: Difficulty) => void;
  onBack: () => void;
}

export default function TimeAttackSetup({ onStart, onBack }: TimeAttackSetupProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('animals');

  const diffList: Difficulty[] = ['easy', 'normal', 'hard'];

  return (
    <div
      className="flex flex-col items-center px-4 py-6"
      style={{ minHeight: '100vh', justifyContent: 'space-evenly' }}
    >
      <motion.h1
        className="text-6xl md:text-8xl font-bold drop-shadow-lg leading-tight text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12 }}
      >
        ⏰ 타임어택!
      </motion.h1>

      <motion.p
        className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        시간 안에 모든 짝을 찾아라!
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <ThemeSelector selected={selectedTheme} onSelect={setSelectedTheme} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-5 text-center dark:text-white">
          난이도를 선택해!
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          {diffList.map((key) => {
            const d = difficulties[key];
            const limit = TIME_LIMITS[key];
            const minutes = Math.floor(limit / 60);
            const seconds = limit % 60;
            const timeStr = seconds > 0 ? `${minutes}분 ${seconds}초` : `${minutes}분`;

            return (
              <motion.button
                key={key}
                onClick={() => onStart(selectedTheme, key)}
                className="bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-700 px-12 py-8 rounded-3xl shadow-md hover:shadow-lg transition-colors min-w-[200px]"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-7xl mb-3">{d.icon}</div>
                <div className="font-bold text-3xl dark:text-white">{d.label}</div>
                <div className="text-xl text-gray-500 dark:text-gray-400 mb-1">
                  {d.cols}x{d.rows} ({d.pairs}쌍)
                </div>
                <div className="text-xl text-red-500 font-bold mt-2">
                  ⏰ {timeStr}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="flex justify-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={onBack}
          className="bg-white/80 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600 px-14 py-6 rounded-2xl font-bold text-3xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏠 돌아가기
        </motion.button>
      </motion.div>
    </div>
  );
}
