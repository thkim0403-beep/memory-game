import { motion, AnimatePresence } from 'framer-motion';

interface EncouragementPopupProps {
  message: string | null;
}

export default function EncouragementPopup({ message }: EncouragementPopupProps) {
  return (
    <AnimatePresence>
      {message !== null && (
        <motion.div
          key={message}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: -40, scale: 1 }}
          exit={{ opacity: 0, y: -120, scale: 1.1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur px-8 py-4 rounded-2xl shadow-2xl text-4xl md:text-5xl font-bold whitespace-nowrap">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
