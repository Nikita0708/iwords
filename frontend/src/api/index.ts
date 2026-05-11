import type { Card, Deck } from '../types';

const BASE = '/api';

function getUserId(): string {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return String(window.Telegram.WebApp.initDataUnsafe.user.id);
  }
  return 'dev-user';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'x-user-id': getUserId(),
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  decks: {
    list: () => request<Deck[]>('/decks'),
    create: (name: string) =>
      request<Deck>('/decks', { method: 'POST', body: JSON.stringify({ name }) }),
    update: (id: string, name: string) =>
      request<Deck>(`/decks/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/decks/${id}`, { method: 'DELETE' }),
  },
  cards: {
    all: () => request<Card[]>('/cards/all'),
    byDeck: (deckId: string) => request<Card[]>(`/cards/deck/${deckId}`),
    create: (deckId: string, data: { front: string; back: string; image?: File }) => {
      const form = new FormData();
      form.append('front', data.front);
      form.append('back', data.back);
      if (data.image) form.append('image', data.image);
      return request<Card>(`/cards/deck/${deckId}`, { method: 'POST', body: form });
    },
    update: (
      id: string,
      data: { front?: string; back?: string; image?: File; removeImage?: boolean }
    ) => {
      const form = new FormData();
      if (data.front) form.append('front', data.front);
      if (data.back) form.append('back', data.back);
      if (data.image) form.append('image', data.image);
      if (data.removeImage) form.append('removeImage', 'true');
      return request<Card>(`/cards/${id}`, { method: 'PUT', body: form });
    },
    remove: (id: string) =>
      request<{ success: boolean }>(`/cards/${id}`, { method: 'DELETE' }),
  },
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: { user?: { id: number; first_name?: string } };
        ready?: () => void;
        expand?: () => void;
        BackButton?: { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void };
        themeParams?: Record<string, string>;
        colorScheme?: 'light' | 'dark';
      };
    };
  }
}
