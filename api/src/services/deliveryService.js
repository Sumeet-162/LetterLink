// Letter delivery service - handles letter delivery timers
import Letter from '../models/Letter.js';
import User from '../models/User.js';

/**
 * Process pending letter deliveries
 * This should be called periodically (e.g., every minute)
 */
export const processDeliveries = async () => {
  try {
    const now = new Date();
    
    // Find letters that are ready for delivery
    const readyLetters = await Letter.find({
      status: 'sent',
      scheduledDelivery: { $lte: now }
    }).populate('recipient', 'username email');
    
    console.log(`Processing ${readyLetters.length} letters ready for delivery`);
    
    for (const letter of readyLetters) {
      await deliverLetter(letter);
    }
    
    return readyLetters.length;
  } catch (error) {
    console.error('Error processing deliveries:', error);
    throw error;
  }
};

/**
 * Deliver a specific letter
 */
const deliverLetter = async (letter) => {
  try {
    // Update letter status to delivered
    letter.status = 'delivered';
    letter.deliveredAt = new Date();
    await letter.save();
    
    console.log(`Letter ${letter._id} delivered to ${letter.recipient.username}`);
    
    // Here you could add:
    // - Email notifications
    // - Push notifications
    // - WebSocket notifications for real-time updates
    
    return letter;
  } catch (error) {
    console.error(`Error delivering letter ${letter._id}:`, error);
    throw error;
  }
};

/**
 * Get delivery status for letters
 */
export const getDeliveryStatus = async (letterIds) => {
  try {
    const letters = await Letter.find({
      _id: { $in: letterIds }
    }).select('_id status deliveryDelay scheduledDelivery deliveredAt readAt');
    
    return letters.map(letter => ({
      letterId: letter._id,
      status: letter.status,
      isInTransit: letter.isInTransit(),
      canRead: letter.canRead(),
      remainingTime: letter.getRemainingDeliveryTime(),
      scheduledDelivery: letter.scheduledDelivery,
      deliveredAt: letter.deliveredAt,
      readAt: letter.readAt
    }));
  } catch (error) {
    console.error('Error getting delivery status:', error);
    throw error;
  }
};

/**
 * Start the delivery processor (runs every minute)
 */
export const startDeliveryProcessor = () => {
  console.log('Starting letter delivery processor...');
  
  // Process immediately
  processDeliveries().catch(console.error);
  
  // Then process every minute
  const interval = setInterval(() => {
    processDeliveries().catch(console.error);
  }, 60 * 1000); // Every minute
  
  return interval;
};

export default {
  processDeliveries,
  getDeliveryStatus,
  startDeliveryProcessor
};
