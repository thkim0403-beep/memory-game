import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ThemeKey, Difficulty } from '../types';
import { difficulties } from '../utils/themes';
import { loadRecords, formatRecord } from '../utils/records';
import { isMuted, toggleMute } from '../utils/sounds';
import ThemeSelector from './ThemeSelector';
import DailyChallengeButton from './DailyChallengeButton';

interface StartScreenProps {
  onStart: (theme: ThemeKey, difficulty: Difficulty) => void;
  onStartStage: (theme: ThemeKey) => void;
  onStartVs: () => void;
  onStartTimeAttack: () => void;
  onStartDaily: () => void;
  onShowRanking: () => void;
  onShowStats: () => void;
  onShowAchievements: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export default function StartScreen({ onStart, onStartStage, onStartVs, onStartTimeAttack, onStartDaily, onShowRanking, onShowStats, onShowAchievements, isDark, onToggleDark }: StartScreenProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('animals');
  const [muted, setMuted] = useState(isMuted());
  const records = loadRecords();

  const handleToggleMute = () => {
    toggleMute();
    setMuted(isMuted());
  };

  const diffList: Difficulty[] = ['easy', 'normal', 'hard'];

  return (
    <div className="flex flex-col items-center px-4 py-6 gap-8 md:gap-12 min-h-screen">
      {/* Top-right toggles */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <motion.button
          onClick={handleToggleMute}
          className="bg-white/70 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 w-14 h-14 rounded-full shadow-md flex items-center justify-center text-2xl transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={muted ? '소리 켜기' : '소리 끄기'}
        >
          {muted ? '🔇' : '🔊'}
        </motion.button>
        <motion.button
          onClick={onToggleDark}
          className="bg-white/70 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 w-14 h-14 rounded-full shadow-md flex items-center justify-center text-2xl transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={isDark ? '라이트 모드' : '다크 모드'}
        >
          {isDark ? '☀️' : '🌙'}
        </motion.button>
      </div>

      <motion.h1
        className="text-8xl md:text-[10rem] font-bold drop-shadow-lg leading-tight"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12 }}
      >
        🃏 짝을 찾아라!
      </motion.h1>

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
        <h2 className="text-4xl md:text-5xl font-bold mb-5 text-center dark:text-white">난이도를 선택해!</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {diffList.map((key) => {
            const d = difficulties[key];
            const rec = records[key];
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
                <div className="text-xl text-gray-500 mb-1">
                  {d.cols}x{d.rows} ({d.pairs}쌍)
                </div>
                {rec && (
                  <div className="text-lg text-purple-600 font-bold mt-2">
                    🏆 {formatRecord(rec)}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Daily Challenge */}
      <motion.div
        className="flex justify-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <DailyChallengeButton onClick={onStartDaily} />
      </motion.div>

      <motion.div
        className="flex flex-wrap justify-center gap-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={() => onStartStage(selectedTheme)}
          className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-14 py-6 rounded-2xl font-bold text-3xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏆 스테이지 모드
        </motion.button>
        <motion.button
          onClick={onStartVs}
          className="bg-gradient-to-r from-blue-500 to-red-500 text-white px-14 py-6 rounded-2xl font-bold text-3xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ⚔️ 2인 대전
        </motion.button>
        <motion.button
          onClick={onStartTimeAttack}
          className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-14 py-6 rounded-2xl font-bold text-3xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ⏰ 타임어택
        </motion.button>
        <motion.button
          onClick={onShowAchievements}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-14 py-6 rounded-2xl font-bold text-3xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏅 업적
        </motion.button>
        <motion.button
          onClick={onShowRanking}
          className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-14 py-6 rounded-2xl font-bold text-3xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏆 랭킹
        </motion.button>
        <motion.button
          onClick={onShowStats}
          className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white px-14 py-6 rounded-2xl font-bold text-3xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📊 통계
        </motion.button>
      </motion.div>
    </div>
  );
}
