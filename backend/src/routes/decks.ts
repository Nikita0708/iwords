import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Deck } from '../models/Deck';
import { Card } from '../models/Card';
import cloudinary from '../config/cloudinary';

const router = Router();

function getUserId(req: Request): string {
  return req.headers['x-user-id'] as string || 'anonymous';
}

router.get('/', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const decks = await Deck.find({ userId }).sort({ createdAt: -1 });
  const decksWithCount = await Promise.all(
    decks.map(async (deck) => {
      const count = await Card.countDocuments({ deckId: deck._id });
      return { ...deck.toObject(), cardCount: count };
    })
  );
  res.json(decksWithCount);
});

router.post(
  '/',
  [body('name').trim().notEmpty().isLength({ max: 100 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = getUserId(req);
    const deck = await Deck.create({ userId, name: req.body.name });
    res.status(201).json(deck);
  }
);

router.put(
  '/:id',
  [param('id').isMongoId(), body('name').trim().notEmpty().isLength({ max: 100 })],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = getUserId(req);
    const deck = await Deck.findOneAndUpdate(
      { _id: req.params.id, userId },
      { name: req.body.name },
      { new: true }
    );
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json(deck);
  }
);

router.delete('/:id', [param('id').isMongoId()], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = getUserId(req);
  const deck = await Deck.findOneAndDelete({ _id: req.params.id, userId });
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  const cards = await Card.find({ deckId: req.params.id });
  await Promise.all(
    cards
      .filter((c) => c.imagePublicId)
      .map((c) => cloudinary.uploader.destroy(c.imagePublicId!))
  );
  await Card.deleteMany({ deckId: req.params.id });

  res.json({ success: true });
});

export default router;
