import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadNickname } from '../utils/records';

interface NicknameModalProps {
  rank: number;
  open: boolean;
  onSubmit: (nickname: string) => void;
  onClose?: () => void;
}

export default function NicknameModal({ rank, open, onSubmit, onClose }: NicknameModalProps) {
  const [nickname, setNickname] = useState(() => loadNickname() || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const saved = loadNickname();
      if (saved) setNickname(saved);
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = () => {
    const name = nickname.trim() || '이름없음';
    onSubmit(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl max-w-md w-full text-center"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <motion.div
              className="text-6xl mb-3"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              🏆
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-2 dark:text-white">
              랭킹 {rank}위!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              이름을 입력해주세요!
            </p>

            <input
              ref={inputRef}
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={10}
              placeholder="이름 입력 (최대 10자)"
              className="w-full text-2xl md:text-3xl font-bold text-center py-4 px-6 rounded-2xl border-3 border-purple-300 dark:border-purple-600 focus:border-purple-500 focus:outline-none bg-purple-50 dark:bg-gray-700 dark:text-white transition-colors"
              style={{ fontFamily: "'Jua', sans-serif" }}
            />

            <motion.button
              onClick={handleSubmit}
              className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-2xl md:text-3xl shadow-lg"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              등록하기!
            </motion.button>

            <button
              onClick={() => onClose ? onClose() : onSubmit('이름없음')}
              className="mt-3 w-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-2 font-bold text-lg transition-colors"
            >
              건너뛰기
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
