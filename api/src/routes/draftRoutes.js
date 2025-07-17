import express from 'express';
import {
  getDrafts,
  getDraftById,
  createDraft,
  updateDraft,
  deleteDraft,
  completeDraft,
  getDraftStats,
  getReplyDraft
} from '../controllers/draftController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All draft routes require authentication
router.use(protect);

// Draft routes
router.get('/', getDrafts);
router.get('/stats', getDraftStats);
router.get('/reply/:replyToId', getReplyDraft);
router.get('/:id', getDraftById);
router.post('/', createDraft);
router.put('/:id', updateDraft);
router.delete('/:id', deleteDraft);
router.patch('/:id/complete', completeDraft);

export default router;
