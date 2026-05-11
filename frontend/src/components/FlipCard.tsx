import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Card } from '../types';

interface Props {
  card: Card;
  reversed: boolean;
}

export function FlipCard({ card, reversed }: Props) {
  const [flipped, setFlipped] = useState(false);

  const front = reversed ? card.back : card.front;
  const back = reversed ? card.front : card.back;

  return (
    <div
      className="relative w-full h-full cursor-pointer select-none"
      style={{ perspective: 1200 }}
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: 'var(--tg-theme-bg-color)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
          }}
        >
          {card.imageUrl && (
            <img
              src={card.imageUrl}
              alt=""
              className="w-full object-cover flex-shrink-0"
              style={{ maxHeight: '55%' }}
            />
          )}
          <div className="flex flex-col items-center justify-center flex-1 px-8 py-6 gap-3">
            <p className="text-4xl font-bold text-center leading-tight" style={{ color: 'var(--tg-theme-text-color)' }}>
              {front}
            </p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--tg-theme-secondary-bg-color)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
          }}
        >
          {card.imageUrl && (
            <img
              src={card.imageUrl}
              alt=""
              className="w-full object-cover flex-shrink-0"
              style={{ maxHeight: '55%' }}
            />
          )}
          <div className="flex flex-col items-center justify-center flex-1 px-8 py-6 gap-3">
            <p className="text-3xl font-bold text-center leading-tight" style={{ color: 'var(--tg-theme-text-color)' }}>
              {back}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
