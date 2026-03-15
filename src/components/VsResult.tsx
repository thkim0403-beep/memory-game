import { motion } from 'framer-motion';
import { formatTime } from '../utils/records';

interface VsResultProps {
  playerNames: string[];
  scores: number[];
  elapsedTime: number;
  onGoToSetup: () => void;
  onGoHome: () => void;
}

export default function VsResult({
  playerNames,
  scores,
  elapsedTime,
  onGoToSetup,
  onGoHome,
}: VsResultProps) {
  const winner =
    scores[0] > scores[1] ? 0 : scores[1] > scores[0] ? 1 : -1;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <motion.h1
        className="text-5xl md:text-6xl font-bold mb-4 dark:text-white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        {winner === -1 ? '🤝 무승부!' : '🎉 승리!'}
      </motion.h1>

      {winner !== -1 && (
        <motion.p
          className="text-2xl font-bold mb-4 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {winner === 0 ? '🔵' : '🔴'} {playerNames[winner]}의 승리!
        </motion.p>
      )}

      <motion.div
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-lg mb-6 text-lg space-y-3 w-full max-w-sm dark:text-gray-100"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <span>🔵 {playerNames[0]}</span>
          <span className={`text-2xl font-bold ${winner === 0 ? 'text-blue-500' : ''}`}>
            {scores[0]}쌍
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>🔴 {playerNames[1]}</span>
          <span className={`text-2xl font-bold ${winner === 1 ? 'text-red-500' : ''}`}>
            {scores[1]}쌍
          </span>
        </div>
        <hr className="border-gray-200 dark:border-gray-600" />
        <p className="text-center">⏱️ {formatTime(elapsedTime)}</p>
      </motion.div>

      <motion.div
        className="flex flex-wrap justify-center gap-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.button
          onClick={onGoToSetup}
          className="bg-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 다시 대전
        </motion.button>
        <motion.button
          onClick={onGoHome}
          className="bg-white/80 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 px-8 py-4 rounded-2xl font-bold text-xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏠 처음으로
        </motion.button>
      </motion.div>
    </div>
  );
}
