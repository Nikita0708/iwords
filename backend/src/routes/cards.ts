import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Card } from '../models/Card';
import { Deck } from '../models/Deck';
import { upload } from '../middleware/upload';
import cloudinary from '../config/cloudinary';
import { resolveReadUserId } from '../middleware/access';

const router = Router();

function getUserId(req: Request): string {
  return req.headers['x-user-id'] as string || 'anonymous';
}

// Get all cards across all decks
router.get('/all', async (req: Request, res: Response) => {
  const userId = resolveReadUserId(getUserId(req));
  const cards = await Card.find({ userId }).populate('deckId', 'name').sort({ createdAt: -1 });
  res.json(cards);
});

// Get cards by deck
router.get('/deck/:deckId', [param('deckId').isMongoId()], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = resolveReadUserId(getUserId(req));
  const deck = await Deck.findOne({ _id: req.params.deckId, userId });
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  const cards = await Card.find({ deckId: req.params.deckId, userId });
  res.json(cards);
});

// Create card
router.post(
  '/deck/:deckId',
  upload.single('image'),
  [
    param('deckId').isMongoId(),
    body('front').trim().notEmpty(),
    body('back').trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        const f = req.file as Express.Multer.File & { filename: string };
        await cloudinary.uploader.destroy(f.filename);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = getUserId(req);
    const deck = await Deck.findOne({ _id: req.params.deckId, userId });
    if (!deck) return res.status(404).json({ error: 'Deck not found' });

    const file = req.file as (Express.Multer.File & { path?: string; filename?: string }) | undefined;

    const card = await Card.create({
      deckId: req.params.deckId,
      userId,
      front: req.body.front,
      back: req.body.back,
      imageUrl: file?.path,
      imagePublicId: file?.filename,
    });

    res.status(201).json(card);
  }
);

// Update card
router.put(
  '/:id',
  upload.single('image'),
  [
    param('id').isMongoId(),
    body('front').optional().trim().notEmpty(),
    body('back').optional().trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = getUserId(req);
    const card = await Card.findOne({ _id: req.params.id, userId });
    if (!card) return res.status(404).json({ error: 'Card not found' });

    const file = req.file as (Express.Multer.File & { path?: string; filename?: string }) | undefined;

    if (file && card.imagePublicId) {
      await cloudinary.uploader.destroy(card.imagePublicId);
    }

    const update: Record<string, string> = {};
    if (req.body.front) update.front = req.body.front;
    if (req.body.back) update.back = req.body.back;
    if (file?.path) update.imageUrl = file.path;
    if (file?.filename) update.imagePublicId = file.filename;

    // Remove image if explicitly requested
    if (req.body.removeImage === 'true' && card.imagePublicId) {
      await cloudinary.uploader.destroy(card.imagePublicId);
      update.imageUrl = '';
      update.imagePublicId = '';
    }

    const updated = await Card.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  }
);

// Delete card
router.delete('/:id', [param('id').isMongoId()], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = getUserId(req);
  const card = await Card.findOneAndDelete({ _id: req.params.id, userId });
  if (!card) return res.status(404).json({ error: 'Card not found' });

  if (card.imagePublicId) {
    await cloudinary.uploader.destroy(card.imagePublicId);
  }

  res.json({ success: true });
});

export default router;
