import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getInTransitLetters,
  processReadyLetters,
  deliverLetter,
  getDeliveryStats
} from '../controllers/inTransitLetterController.js';

const router = express.Router();

// Get all in-transit letters for the authenticated user
router.get('/in-transit', protect, getInTransitLetters);

// Process letters that are ready for delivery (background job endpoint)
router.post('/process-ready', protect, processReadyLetters);

// Manually deliver a specific letter
router.post('/deliver/:letterId', protect, deliverLetter);

// Get delivery statistics for the user
router.get('/stats', protect, getDeliveryStats);

export default router;
