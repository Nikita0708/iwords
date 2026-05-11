import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '../types';
import { FlipCard } from './FlipCard';

interface Props {
  cards: Card[];
  reversed: boolean;
}

export function CardSwiper({ cards, reversed }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const dragStartY = useRef<number>(0);

  const go = useCallback(
    (dir: 'up' | 'down') => {
      setDirection(dir);
      setIndex((i) => {
        if (dir === 'up') return (i + 1) % cards.length;
        return (i - 1 + cards.length) % cards.length;
      });
    },
    [cards.length]
  );

  const handleDragStart = (_: unknown, info: { point: { y: number } }) => {
    dragStartY.current = info.point.y;
  };

  const handleDragEnd = (_: unknown, info: { offset: { y: number } }) => {
    const dy = info.offset.y;
    if (Math.abs(dy) > 60) {
      go(dy < 0 ? 'up' : 'down');
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <p className="text-5xl">🃏</p>
        <p className="text-lg font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>
          Нет карточек
        </p>
        <p className="text-sm text-center" style={{ color: 'var(--tg-theme-hint-color)' }}>
          Добавь карточки в эту колоду, чтобы начать учиться
        </p>
      </div>
    );
  }

  const variants = {
    enter: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? '100%' : '-100%',
      opacity: 0,
    }),
    center: { y: 0, opacity: 1 },
    exit: (dir: 'up' | 'down') => ({
      y: dir === 'up' ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div className="flex-1 relative overflow-hidden px-4 pb-4">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${index}-${cards[index]._id}`}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.18}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="absolute inset-4"
        >
          <FlipCard card={cards[index]} reversed={reversed} />
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        style={{ color: 'var(--tg-theme-hint-color)' }}
      >
        <p className="text-xs">
          {index + 1} / {cards.length}
        </p>
      </div>
    </div>
  );
}
