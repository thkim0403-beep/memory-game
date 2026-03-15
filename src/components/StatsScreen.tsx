import { motion } from 'framer-motion';
import { getStats } from '../utils/stats';
import { themes } from '../utils/themes';
import { formatTime } from '../utils/records';
import type { ThemeKey } from '../types';

interface StatsScreenProps {
  onBack: () => void;
}

export default function StatsScreen({ onBack }: StatsScreenProps) {
  const stats = getStats();

  const clearRate = stats.totalPlays > 0
    ? Math.round((stats.totalClears / stats.totalPlays) * 100)
    : 0;

  const avgAttempts = stats.totalClears > 0
    ? Math.round((stats.clearAttempts ?? stats.totalAttempts) / stats.totalClears * 10) / 10
    : 0;

  // 가장 많이 한 테마 TOP 5
  const topThemes = Object.entries(stats.themePlays)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 5);

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-6">
      <motion.h1
        className="text-5xl md:text-7xl font-bold mb-8 dark:text-white"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12 }}
      >
        📊 통계
      </motion.h1>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {[
          { label: '총 게임 수', value: `${stats.totalPlays}판`, icon: '🎮' },
          { label: '클리어율', value: `${clearRate}%`, icon: '✅' },
          { label: '평균 시도', value: stats.totalClears > 0 ? `${avgAttempts}회` : '-', icon: '🔄' },
          { label: '총 플레이 시간', value: formatTime(stats.totalTime), icon: '⏱️' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-5 shadow-lg text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <div className="text-4xl mb-2">{item.icon}</div>
            <div className="text-3xl md:text-4xl font-bold dark:text-white">{item.value}</div>
            <div className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mt-1">{item.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Top Themes */}
      <motion.div
        className="w-full max-w-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-3xl shadow-lg p-6 mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold mb-4 text-center dark:text-white">🏅 자주 플레이한 테마 TOP 5</h2>
        {topThemes.length === 0 ? (
          <p className="text-center text-xl text-gray-500 dark:text-gray-400 py-4">아직 기록이 없어요!</p>
        ) : (
          <div className="space-y-3">
            {topThemes.map(([key, count], i) => {
              const theme = themes[key as ThemeKey];
              if (!theme) return null;
              return (
                <motion.div
                  key={key}
                  className="flex items-center gap-4 bg-white/60 dark:bg-gray-700/60 rounded-xl px-4 py-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                >
                  <span className="text-2xl font-bold text-purple-500 dark:text-purple-400 w-8">{i + 1}</span>
                  <span className="text-3xl">{theme.icon}</span>
                  <span className="text-xl md:text-2xl font-bold flex-1 dark:text-white">{theme.name}</span>
                  <span className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-bold">{count}판</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.button
        onClick={onBack}
        className="bg-white/80 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 px-10 py-4 rounded-2xl font-bold text-2xl shadow-lg transition-all duration-200 dark:text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ← 뒤로
      </motion.button>
    </div>
  );
}
