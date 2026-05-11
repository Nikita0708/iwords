import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { CreateCardModal } from '../components/CreateCardModal';
import type { Card } from '../types';
import { api } from '../api';

export function DeckView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { decks, removeCard } = useStore();
  const deck = decks.find((d) => d._id === id);

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.cards.byDeck(id);
      setCards(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDelete = async (cardId: string) => {
    if (!confirm('Удалить карточку?')) return;
    setDeletingId(cardId);
    try {
      await removeCard(cardId);
      setCards((c) => c.filter((x) => x._id !== cardId));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--tg-theme-secondary-bg-color)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3" style={{ background: 'var(--tg-theme-bg-color)' }}>
        <button onClick={() => navigate('/')} className="text-2xl w-9 h-9 flex items-center justify-center rounded-full" style={{ color: 'var(--tg-theme-link-color)' }}>
          ‹
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate" style={{ color: 'var(--tg-theme-text-color)' }}>
            {deck?.name ?? 'Колода'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
            {cards.length} карточек
          </p>
        </div>
        <button
          onClick={() => navigate(`/study/${id}`)}
          disabled={cards.length === 0}
          className="px-4 py-2 rounded-xl font-semibold text-sm disabled:opacity-40"
          style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
        >
          Учить
        </button>
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex-1 flex items-center justify-center pt-16">
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--tg-theme-button-color)', borderTopColor: 'transparent' }} />
          </div>
        ) : cards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 pt-16">
            <span className="text-6xl">🃏</span>
            <p className="text-lg font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>Нет карточек</p>
            <p className="text-sm text-center px-8" style={{ color: 'var(--tg-theme-hint-color)' }}>
              Добавь первую карточку в эту колоду
            </p>
          </div>
        ) : (
          cards.map((card) => (
            <motion.div
              key={card._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--tg-theme-bg-color)' }}
            >
              <div className="flex">
                {card.imageUrl && (
                  <img src={card.imageUrl} alt="" className="w-20 h-20 object-cover flex-shrink-0" />
                )}
                <div className="flex-1 px-4 py-3 min-w-0">
                  <p className="font-semibold text-base truncate" style={{ color: 'var(--tg-theme-text-color)' }}>
                    {card.front}
                  </p>
                  <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {card.back}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(card._id)}
                  disabled={deletingId === card._id}
                  className="px-4 flex items-center opacity-40 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--tg-theme-text-color)' }}
                >
                  🗑
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* FAB */}
      <div className="sticky bottom-6 flex justify-center pb-2">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowCreate(true)}
          className="px-6 py-3.5 rounded-2xl font-semibold text-base flex items-center gap-2 shadow-lg"
          style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
        >
          <span className="text-lg">+</span> Добавить карточку
        </motion.button>
      </div>

      <CreateCardModal
        open={showCreate}
        deckId={id!}
        onClose={() => { setShowCreate(false); load(); }}
      />
    </div>
  );
}
