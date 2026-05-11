import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateDeckModal({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const addDeck = useStore((s) => s.addDeck);

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await addDeck(name.trim());
      setName('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 flex flex-col gap-4"
            style={{ background: 'var(--tg-theme-bg-color)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-2" style={{ background: 'var(--tg-theme-hint-color)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
              Новая колода
            </h2>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Название колоды..."
              maxLength={100}
              className="w-full rounded-2xl px-4 py-3 text-base outline-none"
              style={{
                background: 'var(--tg-theme-secondary-bg-color)',
                color: 'var(--tg-theme-text-color)',
              }}
            />
            <button
              onClick={submit}
              disabled={!name.trim() || loading}
              className="w-full rounded-2xl py-3.5 font-semibold text-base transition-opacity disabled:opacity-40"
              style={{
                background: 'var(--tg-theme-button-color)',
                color: 'var(--tg-theme-button-text-color)',
              }}
            >
              {loading ? 'Создаю...' : 'Создать'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
