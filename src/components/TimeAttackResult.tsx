import { motion } from 'framer-motion';
import type { TimeAttackResult as TimeAttackResultData } from '../hooks/useTimeAttack';
import { formatTime } from '../utils/records';

interface TimeAttackResultProps {
  result: TimeAttackResultData;
  onRetry: () => void;
  onGoHome: () => void;
}

export default function TimeAttackResult({ result, onRetry, onGoHome }: TimeAttackResultProps) {
  const { cleared, attempts, totalPairs, timeLimit, remainingTime, bonusScore, totalScore } = result;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6">
      {/* 결과 헤더 */}
      <motion.div
        className="text-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        {cleared ? (
          <>
            <div className="text-8xl mb-4">🎉</div>
            <h1 className="text-5xl md:text-6xl font-bold text-green-600">
              클리어!
            </h1>
          </>
        ) : (
          <>
            <div className="text-8xl mb-4">⏰</div>
            <h1 className="text-5xl md:text-6xl font-bold text-red-500">
              시간 초과!
            </h1>
          </>
        )}
      </motion.div>

      {/* 상세 결과 */}
      <motion.div
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-3xl p-8 shadow-lg w-full max-w-md space-y-4 text-2xl dark:text-gray-100"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <span>⏱️ 제한 시간</span>
          <strong>{formatTime(timeLimit)}</strong>
        </div>

        {cleared && (
          <div className="flex justify-between items-center">
            <span>⏳ 남은 시간</span>
            <strong className="text-green-600">{formatTime(remainingTime)}</strong>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span>🔄 시도 횟수</span>
          <strong>{attempts}회</strong>
        </div>

        <div className="flex justify-between items-center">
          <span>✅ 짝 맞추기</span>
          <strong>
            {cleared ? totalPairs : '미완료'} / {totalPairs}
          </strong>
        </div>

        {cleared && (
          <>
            <hr className="border-gray-300 dark:border-gray-600" />
            <div className="flex justify-between items-center text-yellow-600">
              <span>⏳ 시간 보너스</span>
              <strong>+{bonusScore}점</strong>
            </div>
            <div className="flex justify-between items-center text-3xl font-bold">
              <span>🏆 총 점수</span>
              <motion.strong
                className="text-purple-600"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {totalScore}점
              </motion.strong>
            </div>
          </>
        )}
      </motion.div>

      {/* 버튼 */}
      <motion.div
        className="flex flex-wrap justify-center gap-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={onRetry}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-5 rounded-2xl font-bold text-2xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 다시 도전
        </motion.button>
        <motion.button
          onClick={onGoHome}
          className="bg-white/80 dark:bg-gray-700 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-600 px-10 py-5 rounded-2xl font-bold text-2xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏠 처음으로
        </motion.button>
      </motion.div>
    </div>
  );
}
