import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDailyChallenge, isDailyChallengeCompleted } from '../utils/dailyChallenge';
import { themes, difficulties } from '../utils/themes';

interface DailyChallengeButtonProps {
  onClick: () => void;
}

export default function DailyChallengeButton({ onClick }: DailyChallengeButtonProps) {
  const [challenge, setChallenge] = useState(() => getDailyChallenge());
  const [completed, setCompleted] = useState(false);

  const theme = themes[challenge.theme];
  const diff = difficulties[challenge.difficulty];

  useEffect(() => {
    setCompleted(isDailyChallengeCompleted(challenge.dateStr));

    // 1분마다 날짜 변경 체크 → 자정 이후 자동 갱신
    const interval = setInterval(() => {
      const latest = getDailyChallenge();
      if (latest.dateStr !== challenge.dateStr) {
        setChallenge(latest);
        setCompleted(isDailyChallengeCompleted(latest.dateStr));
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [challenge.dateStr]);

  return (
    <motion.button
      onClick={completed ? undefined : onClick}
      disabled={completed}
      className={`relative overflow-hidden px-8 py-3 md:px-12 md:py-4 rounded-xl md:rounded-2xl font-bold text-xl md:text-2xl shadow-lg transition-colors ${
        completed
          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white cursor-not-allowed opacity-80'
          : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
      }`}
      whileHover={completed ? {} : { scale: 1.05 }}
      whileTap={completed ? {} : { scale: 0.95 }}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl md:text-3xl">
          {completed ? '✅' : '🎯'} 오늘의 도전
        </span>
        <span className="text-sm md:text-lg opacity-90">
          {theme.icon} {theme.name} · {diff.icon} {diff.label}
        </span>
        {completed && (
          <motion.span
            className="text-lg bg-white/20 px-4 py-1 rounded-full mt-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            이미 완료했습니다!
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
