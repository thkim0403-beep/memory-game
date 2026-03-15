import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ThemeKey, Difficulty } from '../types';
import { difficulties } from '../utils/themes';
import ThemeSelector from './ThemeSelector';

interface VsSetupProps {
  onStart: (theme: ThemeKey, difficulty: Difficulty, names: [string, string]) => void;
  onBack: () => void;
}

export default function VsSetup({ onStart, onBack }: VsSetupProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('animals');
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('normal');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');

  const diffList: Difficulty[] = ['easy', 'normal', 'hard'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <motion.h1
        className="text-4xl md:text-5xl font-bold mb-6"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        ⚔️ 2인 대전!
      </motion.h1>

      <motion.div
        className="bg-white/70 rounded-2xl p-6 shadow-md mb-6 w-full max-w-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-bold mb-3">이름을 입력해!</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔵</span>
            <input
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="Player 1"
              className="flex-1 px-3 py-2 rounded-xl border-2 border-blue-200 focus:border-blue-400 outline-none font-bold"
              maxLength={10}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔴</span>
            <input
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="Player 2"
              className="flex-1 px-3 py-2 rounded-xl border-2 border-red-200 focus:border-red-400 outline-none font-bold"
              maxLength={10}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <ThemeSelector selected={selectedTheme} onSelect={setSelectedTheme} />
      </motion.div>

      <motion.div
        className="mt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-bold mb-3">난이도</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {diffList.map((key) => {
            const d = difficulties[key];
            const isSelected = selectedDiff === key;
            return (
              <motion.button
                key={key}
                onClick={() => setSelectedDiff(key)}
                className={`px-5 py-3 rounded-2xl font-bold transition-colors ${
                  isSelected
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/70 hover:bg-white shadow-md'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl">{d.icon}</div>
                <div>{d.label}</div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="flex gap-3 mt-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={onBack}
          className="bg-white/70 px-6 py-3 rounded-xl font-bold text-lg shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← 뒤로
        </motion.button>
        <motion.button
          onClick={() =>
            onStart(selectedTheme, selectedDiff, [name1 || 'Player 1', name2 || 'Player 2'])
          }
          className="bg-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          대결 시작! ⚔️
        </motion.button>
      </motion.div>
    </div>
  );
}
