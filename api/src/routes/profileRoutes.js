import express from 'express';
import { updateProfile, updateBasicProfile, getProfile, checkProfileStatus } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All profile routes require authentication
router.use(protect);

// Profile routes
router.get('/status', checkProfileStatus);
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/basic', updateBasicProfile);

export default router;
