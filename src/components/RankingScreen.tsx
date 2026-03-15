import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Difficulty, RankingEntry } from '../types';
import { difficulties } from '../utils/themes';
import { getRanking, formatTime, formatDate } from '../utils/records';

interface RankingScreenProps {
  onBack: () => void;
  highlightEntry?: { difficulty: Difficulty; rank: number } | null;
}

const diffList: Difficulty[] = ['easy', 'normal', 'hard'];

const medalEmojis: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

function RankingRow({
  entry,
  rank,
  isHighlighted,
  index,
}: {
  entry: RankingEntry;
  rank: number;
  isHighlighted: boolean;
  index: number;
}) {
  return (
    <motion.tr
      className={`border-b border-purple-100 dark:border-gray-700 last:border-b-0 ${
        isHighlighted
          ? 'bg-yellow-100 dark:bg-yellow-900/40'
          : rank % 2 === 0
            ? 'bg-purple-50/30 dark:bg-gray-700/30'
            : ''
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <td className="py-3 px-3 text-center text-2xl font-bold dark:text-gray-100">
        {medalEmojis[rank] || <span className="text-gray-500 dark:text-gray-400">{rank}</span>}
      </td>
      <td className="py-3 px-3 text-center text-xl md:text-2xl font-bold truncate max-w-[120px] dark:text-gray-100">
        {isHighlighted && (
          <motion.span
            className="inline-block mr-1"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            ✨
          </motion.span>
        )}
        {entry.nickname}
      </td>
      <td className="py-3 px-3 text-center text-xl md:text-2xl dark:text-gray-200">{entry.attempts}회</td>
      <td className="py-3 px-3 text-center text-xl md:text-2xl dark:text-gray-200">{formatTime(entry.time)}</td>
      <td className="py-3 px-3 text-center text-xl md:text-2xl dark:text-gray-200">{entry.themeName}</td>
      <td className="py-3 px-3 text-center text-lg text-gray-500 dark:text-gray-400">{formatDate(entry.date)}</td>
    </motion.tr>
  );
}

function EmptyRanking() {
  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-6xl mb-4">🏆</div>
      <p className="text-2xl text-gray-500 dark:text-gray-400">아직 기록이 없어요!</p>
      <p className="text-xl text-gray-400 dark:text-gray-500 mt-2">게임을 플레이해서 기록을 남겨보세요!</p>
    </motion.div>
  );
}

export default function RankingScreen({ onBack, highlightEntry }: RankingScreenProps) {
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>(
    highlightEntry?.difficulty || 'easy',
  );
  const rankings = getRanking(selectedDiff);

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-6">
      {/* Title */}
      <motion.h1
        className="text-5xl md:text-7xl font-bold mb-6"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12 }}
      >
        🏆 랭킹
      </motion.h1>

      {/* Difficulty Tabs */}
      <motion.div
        className="flex gap-3 mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {diffList.map((key) => {
          const d = difficulties[key];
          const isActive = selectedDiff === key;
          return (
            <motion.button
              key={key}
              onClick={() => setSelectedDiff(key)}
              className={`px-6 md:px-10 py-3 md:py-4 rounded-2xl font-bold text-xl md:text-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white/70 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {d.icon} {d.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Ranking Table */}
      <motion.div
        className="w-full max-w-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-3xl shadow-lg overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDiff}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {rankings.length === 0 ? (
              <EmptyRanking />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-purple-500 text-white">
                      <th className="py-3 px-3 text-center text-xl md:text-2xl font-bold">순위</th>
                      <th className="py-3 px-3 text-center text-xl md:text-2xl font-bold">이름</th>
                      <th className="py-3 px-3 text-center text-xl md:text-2xl font-bold">시도</th>
                      <th className="py-3 px-3 text-center text-xl md:text-2xl font-bold">시간</th>
                      <th className="py-3 px-3 text-center text-xl md:text-2xl font-bold">테마</th>
                      <th className="py-3 px-3 text-center text-xl md:text-2xl font-bold">날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((entry, i) => {
                      const rank = i + 1;
                      const isHighlighted =
                        highlightEntry !== null &&
                        highlightEntry !== undefined &&
                        highlightEntry.difficulty === selectedDiff &&
                        highlightEntry.rank === rank;
                      return (
                        <RankingRow
                          key={`${selectedDiff}-${i}`}
                          entry={entry}
                          rank={rank}
                          isHighlighted={isHighlighted}
                          index={i}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Back button */}
      <motion.button
        onClick={onBack}
        className="mt-8 bg-white/80 dark:bg-gray-700 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-600 px-10 py-4 rounded-2xl font-bold text-2xl shadow-lg transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        ← 뒤로
      </motion.button>
    </div>
  );
}
