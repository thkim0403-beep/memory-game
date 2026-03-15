import { motion } from 'framer-motion';
import { getAchievements, getAchievementProgress } from '../utils/achievements';

interface AchievementsScreenProps {
  onBack: () => void;
}

export default function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const achievements = getAchievements();
  const progress = getAchievementProgress();
  const achievedCount = achievements.filter((a) => a.achieved).length;
  const totalCount = achievements.length;
  const percentStr = Math.round(progress * 100);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      {/* 헤더 */}
      <motion.h1
        className="text-5xl md:text-6xl font-bold mb-6"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        🏅 업적
      </motion.h1>

      {/* 달성률 프로그레스바 */}
      <motion.div
        className="w-full max-w-lg mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex justify-between items-center mb-2 text-2xl font-bold dark:text-gray-100">
          <span>달성률</span>
          <span className="text-purple-600 dark:text-purple-400">
            {achievedCount}/{totalCount} ({percentStr}%)
          </span>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentStr}%` }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* 업적 목록 */}
      <div className="w-full max-w-lg space-y-4 mb-8">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className={`flex items-center gap-4 p-5 rounded-2xl shadow-md transition-colors ${
              achievement.achieved
                ? 'bg-white/90 dark:bg-gray-800/90'
                : 'bg-gray-100/60 dark:bg-gray-800/40 opacity-60'
            }`}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: achievement.achieved ? 1 : 0.6 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            {/* 아이콘 */}
            <div
              className={`text-5xl flex-shrink-0 ${
                achievement.achieved ? '' : 'grayscale'
              }`}
            >
              {achievement.achieved ? achievement.icon : '🔒'}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-2xl truncate dark:text-gray-100">{achievement.name}</span>
                {achievement.achieved && (
                  <span className="text-green-500 text-xl flex-shrink-0">✅</span>
                )}
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400 truncate">
                {achievement.description}
              </p>
            </div>

            {/* 달성 여부 표시 */}
            {achievement.achieved && achievement.achievedAt && (
              <div className="text-sm text-gray-400 dark:text-gray-500 flex-shrink-0 hidden md:block">
                {new Date(achievement.achievedAt).toLocaleDateString('ko-KR')}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 뒤로 버튼 */}
      <motion.button
        onClick={onBack}
        className="bg-white/80 dark:bg-gray-700 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-600 px-14 py-6 rounded-2xl font-bold text-3xl shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        🏠 뒤로
      </motion.button>
    </div>
  );
}
