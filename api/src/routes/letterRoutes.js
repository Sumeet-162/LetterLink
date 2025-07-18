import express from 'express';
import {
  getInbox,
  getSentLetters,
  getLetterById,
  sendLetter,
  replyToLetter,
  getConversation,
  getMatchedRecipients,
  archiveLetter,
  markAsRead,
  sendRandomMatchLetter,
  getNextCycleInfo,
  triggerLetterCycle,
  getArchivedLetters,
  acceptFriendLetter,
  rejectFriendLetter,
  getPendingFriendLetters,
  getIncomingLetters,
  deliverScheduledLetters
} from '../controllers/letterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All letter routes require authentication
router.use(protect);

// Letter cycle routes
router.get('/cycle/next', getNextCycleInfo);
router.post('/cycle/trigger', triggerLetterCycle); // For testing
router.get('/archived', getArchivedLetters);

// Friend letter routes
router.get('/pending-friend-letters', getPendingFriendLetters);
router.post('/:letterId/accept', acceptFriendLetter);
router.post('/:letterId/reject', rejectFriendLetter);

// Letter routes
router.get('/inbox', getInbox);
router.get('/incoming', getIncomingLetters);
router.get('/sent', getSentLetters);
router.post('/deliver-scheduled', deliverScheduledLetters);
router.get('/matched-recipients', getMatchedRecipients);
router.get('/conversation/:friendId', getConversation);
router.get('/:id', getLetterById);
router.post('/', sendLetter);
router.post('/reply', replyToLetter);
router.post('/random-match', sendRandomMatchLetter);
router.post('/:id/read', markAsRead);
router.patch('/:id/archive', archiveLetter);

export default router;
