import { motion, AnimatePresence } from 'framer-motion';

interface ComboPopupProps {
  combo: number | null;
}

export default function ComboPopup({ combo }: ComboPopupProps) {
  return (
    <AnimatePresence>
      {combo !== null && combo >= 2 && (
        <motion.div
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0, y: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12 }}
        >
          <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-10 py-5 rounded-2xl shadow-2xl text-5xl font-bold whitespace-nowrap">
            {'🔥'.repeat(Math.min(combo, 5))} {combo}콤보!
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
