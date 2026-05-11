import mongoose, { Document, Schema } from 'mongoose';

export interface ICard extends Document {
  deckId: mongoose.Types.ObjectId;
  userId: string;
  front: string;
  back: string;
  imageUrl?: string;
  imagePublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>(
  {
    deckId: { type: Schema.Types.ObjectId, ref: 'Deck', required: true, index: true },
    userId: { type: String, required: true, index: true },
    front: { type: String, required: true, trim: true },
    back: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    imagePublicId: { type: String },
  },
  { timestamps: true }
);

export const Card = mongoose.model<ICard>('Card', CardSchema);
