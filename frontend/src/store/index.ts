import { create } from 'zustand';
import type { Card, Deck } from '../types';
import { api } from '../api';

interface AppState {
  decks: Deck[];
  allCards: Card[];
  loading: boolean;
  error: string | null;

  fetchDecks: () => Promise<void>;
  fetchAllCards: () => Promise<void>;
  addDeck: (name: string) => Promise<Deck>;
  updateDeck: (id: string, name: string) => Promise<void>;
  removeDeck: (id: string) => Promise<void>;
  addCard: (deckId: string, data: { front: string; back: string; image?: File }) => Promise<Card>;
  updateCard: (id: string, data: { front?: string; back?: string; image?: File; removeImage?: boolean }) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  decks: [],
  allCards: [],
  loading: false,
  error: null,

  fetchDecks: async () => {
    set({ loading: true, error: null });
    try {
      const decks = await api.decks.list();
      set({ decks, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  fetchAllCards: async () => {
    set({ loading: true, error: null });
    try {
      const allCards = await api.cards.all();
      set({ allCards, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  addDeck: async (name) => {
    const deck = await api.decks.create(name);
    set((s) => ({ decks: [deck, ...s.decks] }));
    return deck;
  },

  updateDeck: async (id, name) => {
    const updated = await api.decks.update(id, name);
    set((s) => ({ decks: s.decks.map((d) => (d._id === id ? updated : d)) }));
  },

  removeDeck: async (id) => {
    await api.decks.remove(id);
    set((s) => ({
      decks: s.decks.filter((d) => d._id !== id),
      allCards: s.allCards.filter((c) =>
        typeof c.deckId === 'string' ? c.deckId !== id : c.deckId._id !== id
      ),
    }));
  },

  addCard: async (deckId, data) => {
    const card = await api.cards.create(deckId, data);
    set((s) => ({
      allCards: [card, ...s.allCards],
      decks: s.decks.map((d) =>
        d._id === deckId ? { ...d, cardCount: d.cardCount + 1 } : d
      ),
    }));
    return card;
  },

  updateCard: async (id, data) => {
    const updated = await api.cards.update(id, data);
    set((s) => ({ allCards: s.allCards.map((c) => (c._id === id ? updated : c)) }));
  },

  removeCard: async (id) => {
    const card = get().allCards.find((c) => c._id === id);
    await api.cards.remove(id);
    const deckId = card ? (typeof card.deckId === 'string' ? card.deckId : card.deckId._id) : null;
    set((s) => ({
      allCards: s.allCards.filter((c) => c._id !== id),
      decks: deckId
        ? s.decks.map((d) =>
            d._id === deckId ? { ...d, cardCount: Math.max(0, d.cardCount - 1) } : d
          )
        : s.decks,
    }));
  },
}));
