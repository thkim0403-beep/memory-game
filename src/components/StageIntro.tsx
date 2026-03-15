import { motion } from 'framer-motion';
import { difficulties, STAGE_ORDER } from '../utils/themes';

interface StageIntroProps {
  stageIndex: number;
  onBegin: () => void;
}

export default function StageIntro({ stageIndex, onBegin }: StageIntroProps) {
  const diff = difficulties[STAGE_ORDER[stageIndex]];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <motion.div
        className="text-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      >
        <div className="text-6xl mb-4">{diff.icon}</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Stage {stageIndex + 1}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          {diff.label} ({diff.cols}x{diff.rows} · {diff.pairs}쌍)
        </p>
        <motion.button
          onClick={onBegin}
          className="bg-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          시작! 🚀
        </motion.button>
      </motion.div>
    </div>
  );
}
