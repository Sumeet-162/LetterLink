import cron from 'node-cron';
import Letter from '../models/Letter.js';
import Friend from '../models/Friend.js';

// Schedule task to run every hour to deliver scheduled letters
const scheduleLetterDelivery = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running scheduled letter delivery check...');
      
      // Find letters that are ready to be delivered
      const readyLetters = await Letter.find({
        status: 'sent',
        scheduledDelivery: { $lte: new Date() }
      });

      for (const letter of readyLetters) {
        // Update letter status to delivered
        letter.status = 'delivered';
        letter.deliveredAt = new Date();
        await letter.save();

        // Update friendship activity
        const friendship = await Friend.findFriendship(letter.sender, letter.recipient);
        if (friendship) {
          await friendship.updateActivity('delivered', letter._id);
        }

        console.log(`Letter ${letter._id} delivered to ${letter.recipient}`);
      }

      if (readyLetters.length > 0) {
        console.log(`Delivered ${readyLetters.length} scheduled letters`);
      }
    } catch (error) {
      console.error('Error in scheduled letter delivery:', error);
    }
  });
};

// Initialize scheduled tasks
export const initScheduledTasks = () => {
  scheduleLetterDelivery();
  console.log('Scheduled tasks initialized');
};

export default { initScheduledTasks };
