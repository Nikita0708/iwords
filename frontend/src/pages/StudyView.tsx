import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { CardSwiper } from '../components/CardSwiper';
import { api } from '../api';
import type { Card } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function StudyView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { decks, allCards } = useStore();
  const isAll = id === 'all';

  const [deckCards, setDeckCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(!isAll);
  const [reversed, setReversed] = useState(false);

  useEffect(() => {
    if (isAll) return;
    api.cards.byDeck(id!).then((data) => {
      setDeckCards(data);
      setLoading(false);
    });
  }, [id, isAll]);

  const rawCards = isAll ? allCards : deckCards;
  const cards = useMemo(() => shuffle(rawCards), [rawCards]);

  const deck = !isAll ? decks.find((d) => d._id === id) : null;
  const title = isAll ? 'Все карточки' : deck?.name ?? 'Колода';

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--tg-theme-secondary-bg-color)' }}>
      {/* Header */}
      <div
        className="px-5 pt-6 pb-4 flex items-center gap-3 flex-shrink-0"
        style={{ background: 'var(--tg-theme-bg-color)' }}
      >
        <button
          onClick={() => navigate(isAll ? '/' : `/deck/${id}`)}
          className="text-2xl w-9 h-9 flex items-center justify-center"
          style={{ color: 'var(--tg-theme-link-color)' }}
        >
          ‹
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate" style={{ color: 'var(--tg-theme-text-color)' }}>
            {title}
          </h1>
          <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
            {cards.length} карточек
          </p>
        </div>

        {/* Language toggle */}
        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-2"
          style={{ background: 'var(--tg-theme-secondary-bg-color)' }}
        >
          <span className="text-xs font-medium" style={{ color: reversed ? 'var(--tg-theme-hint-color)' : 'var(--tg-theme-text-color)' }}>
            A→B
          </span>
          <button
            onClick={() => setReversed((r) => !r)}
            className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
            style={{ background: reversed ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-hint-color)' }}
            aria-label="Переключить язык"
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200"
              style={{
                background: 'white',
                left: reversed ? 'calc(100% - 1.375rem)' : '0.125rem',
              }}
            />
          </button>
          <span className="text-xs font-medium" style={{ color: reversed ? 'var(--tg-theme-text-color)' : 'var(--tg-theme-hint-color)' }}>
            B→A
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--tg-theme-button-color)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <CardSwiper cards={cards} reversed={reversed} />
      )}
    </div>
  );
}
