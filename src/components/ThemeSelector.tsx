import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ThemeKey } from '../types';
import { themes, themeGroups } from '../utils/themes';
import { isThemeLocked, getUnlockedCount, getTotalThemeCount, getClearsToUnlock } from '../utils/unlocks';

interface ThemeSelectorProps {
  selected: ThemeKey;
  onSelect: (key: ThemeKey) => void;
}

function ThemeButton({ themeKey, isSelected, onSelect }: { themeKey: ThemeKey; isSelected: boolean; onSelect: (k: ThemeKey) => void }) {
  const t = themes[themeKey];
  const locked = isThemeLocked(themeKey);
  return (
    <motion.button
      onClick={() => { if (!locked) onSelect(themeKey); }}
      className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold text-lg md:text-3xl transition-colors duration-200 ${
        locked
          ? 'bg-gray-200/70 text-gray-400 cursor-not-allowed dark:bg-gray-600/50 dark:text-gray-500'
          : isSelected
            ? 'text-white shadow-lg'
            : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md dark:bg-gray-700/70 dark:text-gray-200'
      }`}
      style={
        !locked && isSelected
          ? { background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})` }
          : locked
            ? { filter: 'grayscale(0.6)', opacity: 0.6 }
            : {}
      }
      animate={{ scale: !locked && isSelected ? 1.08 : 1 }}
      whileHover={{ scale: locked ? 1 : isSelected ? 1.08 : 1.04 }}
      whileTap={{ scale: locked ? 1 : 0.95 }}
    >
      <span className="text-2xl md:text-5xl">{locked ? '🔒' : t.icon}</span>
      <span>{t.name}</span>
      {locked && (
        <span className="text-[10px] md:text-sm bg-gray-300/80 dark:bg-gray-500/60 text-gray-600 dark:text-gray-300 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full leading-none">
          {getClearsToUnlock(themeKey)}번 클리어 후
        </span>
      )}
      {!locked && t.isApi && <span className="text-[10px] md:text-sm bg-white/30 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full leading-none">API</span>}
    </motion.button>
  );
}

// Find which group the selected theme belongs to
function findGroupForTheme(key: ThemeKey): string {
  for (const g of themeGroups) {
    if (g.keys.includes(key)) return g.label;
  }
  return themeGroups[0].label;
}

export default function ThemeSelector({ selected, onSelect }: ThemeSelectorProps) {
  const [openGroup, setOpenGroup] = useState(() => findGroupForTheme(selected));

  const previewEmojis = themes[selected].emojis.length > 0
    ? themes[selected].emojis.slice(0, 4)
    : null;

  return (
    <div className="mb-1 md:mb-2 w-full max-w-6xl mx-auto">
      <div className="flex flex-col items-center gap-0.5 md:gap-1 mb-2">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          <h2 className="text-xl md:text-4xl font-bold text-center">카드 테마를 골라봐!</h2>
          <span className="text-xs md:text-lg bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full">
            🔓 {getUnlockedCount()}/{getTotalThemeCount()}
          </span>
        </div>
        {getUnlockedCount() < getTotalThemeCount() && (
          <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400">
            🎯 게임을 클리어할 때마다 새로운 테마가 해금돼요!
          </p>
        )}
      </div>

      <div className="max-h-[28vh] md:max-h-[30vh] overflow-y-auto pr-1 scrollbar-thin">
      {themeGroups.map((group) => {
        const isOpen = openGroup === group.label;
        const hasSelected = group.keys.includes(selected);

        return (
          <div key={group.label} className="mb-0.5 md:mb-1">
            <button
              onClick={() => setOpenGroup(isOpen ? '' : group.label)}
              className={`flex items-center gap-1.5 w-full text-left text-sm md:text-xl font-bold mb-0.5 px-2 py-0.5 rounded-lg transition-colors ${
                hasSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
              } hover:bg-white/30 dark:hover:bg-gray-700/30`}
            >
              <span className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
              <span>{group.icon} {group.label}</span>
              {hasSelected && <span className="text-xs md:text-sm bg-purple-200 dark:bg-purple-800 px-1.5 py-0.5 rounded-full">{themes[selected].icon} {themes[selected].name}</span>}
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1.5 md:gap-3 pb-1 pl-3">
                    {group.keys.map((key) => (
                      <ThemeButton key={key} themeKey={key} isSelected={selected === key} onSelect={onSelect} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      </div>

      {/* Preview */}
      <motion.div
        key={selected}
        className="flex justify-center gap-2 md:gap-4 mt-1 md:mt-2 text-3xl md:text-5xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {previewEmojis ? (
          previewEmojis.map((emoji, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {emoji}
            </motion.span>
          ))
        ) : (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xl md:text-3xl text-gray-500"
          >
            🌐 API에서 불러와요!
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
