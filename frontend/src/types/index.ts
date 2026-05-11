export interface Deck {
  _id: string;
  userId: string;
  name: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  _id: string;
  deckId: string | { _id: string; name: string };
  userId: string;
  front: string;
  back: string;
  imageUrl?: string;
  imagePublicId?: string;
  createdAt: string;
  updatedAt: string;
}
