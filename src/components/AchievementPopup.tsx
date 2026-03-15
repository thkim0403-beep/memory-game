import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '../utils/achievements';

interface AchievementPopupProps {
  achievements: Achievement[];
  onDone?: () => void;
}

/**
 * 업적 달성 시 화면 상단에 표시되는 팝업
 * - 여러 업적이 동시에 달성되면 순차적으로 표시
 * - 각 업적은 3초 후 자동으로 사라짐
 */
export default function AchievementPopup({ achievements, onDone }: AchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (achievements.length === 0) return;

    setCurrentIndex(0);
    setVisible(true);
  }, [achievements]);

  useEffect(() => {
    if (achievements.length === 0) return;
    if (currentIndex >= achievements.length) {
      onDone?.();
      return;
    }

    setVisible(true);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 2700);

    const nextTimer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onDone?.();
      }
    }, 3200);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, achievements, onDone]);

  if (achievements.length === 0 || currentIndex >= achievements.length) {
    return null;
  }

  const achievement = achievements[currentIndex];

  return (
    <div className="fixed top-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={achievement.id}
            className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-white px-10 py-5 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto"
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {/* 배지 이모지 */}
            <motion.span
              className="text-5xl"
              animate={{
                rotate: [0, -15, 15, -10, 10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {achievement.icon}
            </motion.span>

            <div>
              <div className="text-lg opacity-90 font-bold">업적 달성!</div>
              <div className="text-2xl font-bold">{achievement.name}</div>
              <div className="text-base opacity-80">{achievement.description}</div>
            </div>

            {/* 축하 별 효과 */}
            <motion.span
              className="text-3xl"
              animate={{
                rotate: [0, 360],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
