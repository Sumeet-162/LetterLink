const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const inTransitLetterController = require('../controllers/inTransitLetterController');

// Get all in-transit letters for the authenticated user
router.get('/in-transit', auth, inTransitLetterController.getInTransitLetters);

// Process letters that are ready for delivery (background job endpoint)
router.post('/process-ready', auth, inTransitLetterController.processReadyLetters);

// Manually deliver a specific letter
router.post('/deliver/:letterId', auth, inTransitLetterController.deliverLetter);

// Get delivery statistics for the user
router.get('/stats', auth, inTransitLetterController.getDeliveryStats);

module.exports = router;
