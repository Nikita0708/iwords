import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { CreateDeckModal } from '../components/CreateDeckModal';

export function Home() {
  const navigate = useNavigate();
  const { decks, allCards, fetchDecks, fetchAllCards, removeDeck, loading } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDecks();
    fetchAllCards();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Удалить колоду со всеми карточками?')) return;
    setDeletingId(id);
    try {
      await removeDeck(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--tg-theme-secondary-bg-color)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between" style={{ background: 'var(--tg-theme-bg-color)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>iWords</h1>
          <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
            {decks.length} {decks.length === 1 ? 'колода' : decks.length < 5 ? 'колоды' : 'колод'}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-light"
          style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
        >
          +
        </button>
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col gap-3">
        {/* All cards shortcut */}
        {allCards.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/study/all')}
            className="w-full rounded-2xl px-5 py-4 flex items-center gap-4 text-left"
            style={{ background: 'var(--tg-theme-button-color)' }}
          >
            <span className="text-3xl">🌐</span>
            <div className="flex-1">
              <p className="font-semibold text-base" style={{ color: 'var(--tg-theme-button-text-color)' }}>
                Все карточки
              </p>
              <p className="text-sm opacity-75" style={{ color: 'var(--tg-theme-button-text-color)' }}>
                {allCards.length} {allCards.length === 1 ? 'карточка' : allCards.length < 5 ? 'карточки' : 'карточек'}
              </p>
            </div>
            <span className="text-xl opacity-60" style={{ color: 'var(--tg-theme-button-text-color)' }}>›</span>
          </motion.button>
        )}

        {/* Deck list */}
        {loading && decks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--tg-theme-button-color)', borderTopColor: 'transparent' }} />
          </div>
        ) : decks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 pt-16">
            <span className="text-6xl">📚</span>
            <p className="text-lg font-semibold" style={{ color: 'var(--tg-theme-text-color)' }}>Нет колод</p>
            <p className="text-sm text-center px-8" style={{ color: 'var(--tg-theme-hint-color)' }}>
              Создай первую колоду с карточками для изучения слов
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-2 px-6 py-3 rounded-2xl font-semibold"
              style={{ background: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
            >
              Создать колоду
            </button>
          </div>
        ) : (
          decks.map((deck) => (
            <motion.div
              key={deck._id}
              whileTap={{ scale: 0.97 }}
              className="rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: 'var(--tg-theme-bg-color)' }}
            >
              <button className="flex-1 flex items-center gap-4 text-left" onClick={() => navigate(`/deck/${deck._id}`)}>
                <span className="text-3xl">📖</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate" style={{ color: 'var(--tg-theme-text-color)' }}>
                    {deck.name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {deck.cardCount} {deck.cardCount === 1 ? 'карточка' : deck.cardCount < 5 ? 'карточки' : 'карточек'}
                  </p>
                </div>
                <span className="text-xl" style={{ color: 'var(--tg-theme-hint-color)' }}>›</span>
              </button>
              <button
                onClick={(e) => handleDelete(deck._id, e)}
                disabled={deletingId === deck._id}
                className="w-8 h-8 flex items-center justify-center rounded-full opacity-40 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--tg-theme-text-color)' }}
              >
                🗑
              </button>
            </motion.div>
          ))
        )}
      </div>

      <CreateDeckModal open={showCreate} onClose={() => { setShowCreate(false); fetchDecks(); }} />
    </div>
  );
}
