import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';

interface Props {
  open: boolean;
  deckId: string;
  onClose: () => void;
}

export function CreateCardModal({ open, deckId, onClose }: Props) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const addCard = useStore((s) => s.addCard);

  useEffect(() => {
    if (!open) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          setImage(file);
          setPreview(URL.createObjectURL(file));
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [open]);

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!front.trim() || !back.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await addCard(deckId, { front: front.trim(), back: back.trim(), image: image ?? undefined });
      setFront('');
      setBack('');
      setImage(null);
      setPreview(null);
      setError(null);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка при создании карточки');
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
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--tg-theme-bg-color)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-2" style={{ background: 'var(--tg-theme-hint-color)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
              Новая карточка
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--tg-theme-hint-color)' }}>
                Слово / Фраза
              </label>
              <input
                autoFocus
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="das Wort"
                className="w-full rounded-2xl px-4 py-3 text-base outline-none"
                style={{
                  background: 'var(--tg-theme-secondary-bg-color)',
                  color: 'var(--tg-theme-text-color)',
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--tg-theme-hint-color)' }}>
                Перевод
              </label>
              <input
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="слово"
                className="w-full rounded-2xl px-4 py-3 text-base outline-none"
                style={{
                  background: 'var(--tg-theme-secondary-bg-color)',
                  color: 'var(--tg-theme-text-color)',
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--tg-theme-hint-color)' }}>
                Картинка (необязательно)
              </label>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="" className="w-full h-40 object-cover rounded-2xl" />
                  <button
                    onClick={() => { setImage(null); setPreview(null); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-2xl py-10 flex flex-col items-center gap-2 border-2 border-dashed transition-opacity"
                  style={{ borderColor: 'var(--tg-theme-hint-color)', color: 'var(--tg-theme-hint-color)' }}
                >
                  <span className="text-3xl">🖼</span>
                  <span className="text-sm">Нажми или вставь из буфера (⌘V)</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
            </div>

            {error && (
              <p className="text-sm text-center px-1" style={{ color: '#ef4444' }}>
                {error}
              </p>
            )}
            <button
              onClick={submit}
              disabled={!front.trim() || !back.trim() || loading}
              className="w-full rounded-2xl py-3.5 font-semibold text-base transition-opacity disabled:opacity-40"
              style={{
                background: 'var(--tg-theme-button-color)',
                color: 'var(--tg-theme-button-text-color)',
              }}
            >
              {loading ? 'Добавляю...' : 'Добавить карточку'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
