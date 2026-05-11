import mongoose, { Document, Schema } from 'mongoose';

export interface IDeck extends Document {
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeckSchema = new Schema<IDeck>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
  },
  { timestamps: true }
);

export const Deck = mongoose.model<IDeck>('Deck', DeckSchema);
