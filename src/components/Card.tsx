import { memo } from 'react';
import { motion } from 'framer-motion';
import type { CardData, Theme } from '../types';

interface CardProps {
  card: CardData;
  theme: Theme;
  index: number;
  onClick: (id: string) => void;
  matchAnim?: boolean;
  shakeAnim?: boolean;
}

const Card = memo(function Card({ card, theme, index, onClick, matchAnim, shakeAnim }: CardProps) {
  const { id, emoji, isFlipped, isMatched } = card;

  return (
    <motion.div
      className={`w-full h-full ${isMatched ? 'cursor-default' : 'cursor-pointer'}`}
      style={{ perspective: '600px' }}
      onClick={isMatched ? undefined : () => onClick(id)}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: matchAnim ? [1, 1.15, 1] : 1,
        x: shakeAnim ? [0, -6, 6, -6, 6, 0] : 0,
      }}
      transition={{
        opacity: { delay: index * 0.05, duration: 0.3 },
        scale: { delay: index * 0.05, duration: 0.3 },
        ...(matchAnim ? { scale: { duration: 0.4, ease: 'easeInOut' } } : {}),
        ...(shakeAnim ? { x: { duration: 0.4, ease: 'easeInOut' } } : {}),
      }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* Back face */}
        <div
          className="absolute inset-0 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30"
          style={{
            backfaceVisibility: 'hidden',
            background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
          }}
        >
          <span className="drop-shadow-md opacity-80" style={{ fontSize: 'min(8vw, 5rem)' }}>{theme.icon}</span>
        </div>

        {/* Front face */}
        <div
          className={`absolute inset-0 rounded-2xl flex items-center justify-center bg-white dark:bg-gray-700 shadow-lg transition-all duration-300 ${
            isMatched
              ? 'border-3 border-green-400 ring-2 ring-green-300/50'
              : shakeAnim
                ? 'border-3 border-red-400 ring-2 ring-red-300/50'
                : 'border-2 border-gray-100'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {card.image ? (
            <img src={card.image} alt={emoji} className="w-[85%] h-[85%] object-contain" draggable={false} />
          ) : (
            <span style={{ fontSize: 'min(10vw, 6rem)' }}>{emoji}</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

export default Card;
