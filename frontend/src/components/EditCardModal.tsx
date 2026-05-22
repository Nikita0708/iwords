import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import type { Card } from '../types';

interface Props {
  card: Card | null;
  onClose: () => void;
}

export function EditCardModal({ card, onClose }: Props) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { updateCard, removeCard } = useStore();

  useEffect(() => {
    if (card) {
      setFront(card.front);
      setBack(card.back);
      setImage(null);
      setPreview(null);
      setRemoveImage(false);
      setError(null);
    }
  }, [card]);

  useEffect(() => {
    if (!card) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          setImage(file);
          setPreview(URL.createObjectURL(file));
          setRemoveImage(false);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [card]);

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setRemoveImage(true);
  };

  const submit = async () => {
    if (!card || !front.trim() || !back.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await updateCard(card._id, {
        front: front.trim(),
        back: back.trim(),
        image: image ?? undefined,
        removeImage,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!card || !confirm('Удалить карточку?')) return;
    setLoading(true);
    try {
      await removeCard(card._id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const currentImage = preview ?? (!removeImage ? card?.imageUrl : null);

  return (
    <AnimatePresence>
      {card && (
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

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
                Редактировать
              </h2>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-sm px-3 py-1.5 rounded-xl opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
              >
                Удалить
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--tg-theme-hint-color)' }}>
                Слово / Фраза
              </label>
              <input
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full rounded-2xl px-4 py-3 text-base outline-none"
                style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--tg-theme-hint-color)' }}>
                Перевод
              </label>
              <input
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full rounded-2xl px-4 py-3 text-base outline-none"
                style={{ background: 'var(--tg-theme-secondary-bg-color)', color: 'var(--tg-theme-text-color)' }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--tg-theme-hint-color)' }}>
                Картинка
              </label>
              {currentImage ? (
                <div className="relative">
                  <img src={currentImage} alt="" className="w-full h-40 object-cover rounded-2xl" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-2xl py-8 flex flex-col items-center gap-2 border-2 border-dashed"
                  style={{ borderColor: 'var(--tg-theme-hint-color)', color: 'var(--tg-theme-hint-color)' }}
                >
                  <span className="text-2xl">🖼</span>
                  <span className="text-sm">Нажми или вставь из буфера (⌘V)</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
            </div>

            {error && (
              <p className="text-sm text-center" style={{ color: '#ef4444' }}>{error}</p>
            )}

            <button
              onClick={submit}
              disabled={!front.trim() || !back.trim() || loading}
              className="w-full rounded-2xl py-3.5 font-semibold text-base transition-opacity disabled:opacity-40"
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              {loading ? 'Сохраняю...' : 'Сохранить'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
