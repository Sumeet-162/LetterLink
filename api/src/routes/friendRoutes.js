import express from 'express';
import {
  getFriends,
  getFriendDetails,
  addFriend,
  removeFriend,
  blockFriend,
  unblockFriend,
  getFriendTimeWeather,
  searchUsers
} from '../controllers/friendController.js';
import {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getRequestStatus
} from '../controllers/friendRequestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All friend routes require authentication
router.use(protect);

// Friend request routes
router.post('/request', sendFriendRequest);
router.get('/requests', getFriendRequests);
router.get('/requests/status', getRequestStatus);
router.post('/requests/:requestId/accept', acceptFriendRequest);
router.post('/requests/:requestId/reject', rejectFriendRequest);

// Friend routes
router.get('/', getFriends);
router.get('/search', searchUsers);
router.get('/:friendId', getFriendDetails);
router.get('/:friendId/time-weather', getFriendTimeWeather);
router.post('/', addFriend);
router.delete('/:friendId', removeFriend);
router.patch('/:friendId/block', blockFriend);
router.patch('/:friendId/unblock', unblockFriend);

export default router;
