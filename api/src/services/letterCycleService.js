import cron from 'node-cron';
import Letter from '../models/Letter.js';
import User from '../models/User.js';

class LetterCycleService {
  constructor() {
    this.isRunning = false;
  }

  // Start the 24-hour cycle scheduler
  start() {
    if (this.isRunning) {
      console.log('Letter cycle service is already running');
      return;
    }

    // Run at midnight every day (00:00)
    cron.schedule('0 0 * * *', async () => {
      console.log('Starting daily letter cycle at:', new Date());
      await this.cycleLetters();
    });

    // Also run immediately for testing (remove in production)
    // this.cycleLetters();

    this.isRunning = true;
    console.log('Letter cycle service started - runs daily at midnight');
  }

  // Main letter cycling logic
  async cycleLetters() {
    try {
      console.log('🔄 Starting letter cycling process...');
      
      // 1. Archive old letters (move delivered/read letters to archived status)
      await this.archiveOldLetters();
      
      // 2. Get all users who have written letters in the last 24 hours
      const activeUsers = await this.getActiveUsers();
      
      // 3. For each active user, send them 3 new letters
      for (const user of activeUsers) {
        await this.deliverNewLettersToUser(user);
      }
      
      console.log('✅ Letter cycling completed successfully');
    } catch (error) {
      console.error('❌ Error during letter cycling:', error);
    }
  }

  // Archive letters that are older than 24 hours
  async archiveOldLetters() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await Letter.updateMany(
      {
        status: { $in: ['delivered', 'read'] },
        deliveredAt: { $lt: twentyFourHoursAgo }
      },
      {
        $set: { 
          status: 'archived',
          archivedAt: new Date()
        }
      }
    );
    
    console.log(`📦 Archived ${result.modifiedCount} old letters`);
  }

  // Get users who have sent letters in the last 24 hours
  async getActiveUsers() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const activeUserIds = await Letter.distinct('sender', {
      createdAt: { $gte: twentyFourHoursAgo },
      type: 'letter' // Only count original letters, not replies
    });
    
    const users = await User.find({ _id: { $in: activeUserIds } });
    console.log(`👥 Found ${users.length} active users to receive new letters`);
    
    return users;
  }

  // Deliver 3 new letters to a specific user
  async deliverNewLettersToUser(user) {
    try {
      // Get available letters from other users (not already sent to this user)
      const availableLetters = await this.getAvailableLettersForUser(user);
      
      if (availableLetters.length < 3) {
        console.log(`⚠️ Not enough letters available for user ${user.username} (found ${availableLetters.length})`);
        // Still deliver what we have
      }
      
      // Select up to 3 letters
      const lettersToDeliver = this.selectBestMatches(user, availableLetters).slice(0, 3);
      
      // Create delivery records
      for (const letter of lettersToDeliver) {
        await this.deliverLetterToUser(letter, user);
      }
      
      console.log(`📬 Delivered ${lettersToDeliver.length} letters to ${user.username}`);
    } catch (error) {
      console.error(`❌ Error delivering letters to user ${user.username}:`, error);
    }
  }

  // Get letters that can be sent to this user
  async getAvailableLettersForUser(user) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find letters from the last 24 hours that:
    // 1. Are not from this user
    // 2. Haven't been delivered to this user yet
    // 3. Are original letters (not replies)
    const availableLetters = await Letter.find({
      sender: { $ne: user._id },
      type: 'letter',
      createdAt: { $gte: twentyFourHoursAgo },
      // Don't include letters already delivered to this user
      _id: { 
        $nin: await Letter.distinct('originalLetter', { 
          recipient: user._id,
          type: 'delivery'
        })
      }
    }).populate('sender', 'name username country interests');
    
    return availableLetters;
  }

  // Select the best matching letters for a user based on interests
  selectBestMatches(user, availableLetters) {
    if (availableLetters.length <= 3) {
      return availableLetters;
    }
    
    // Score letters based on interest matching
    const scoredLetters = availableLetters.map(letter => {
      const senderInterests = letter.sender.interests || [];
      const userInterests = user.interests || [];
      
      // Calculate interest overlap
      const commonInterests = senderInterests.filter(interest => 
        userInterests.includes(interest)
      ).length;
      
      const score = commonInterests + Math.random() * 0.1; // Add small random factor
      
      return { letter, score };
    });
    
    // Sort by score (highest first) and return top letters
    return scoredLetters
      .sort((a, b) => b.score - a.score)
      .map(item => item.letter);
  }

  // Create a delivery record for a letter to a user
  async deliverLetterToUser(originalLetter, recipient) {
    const deliveryLetter = new Letter({
      subject: originalLetter.subject,
      content: originalLetter.content,
      sender: originalLetter.sender,
      recipient: recipient._id,
      status: 'delivered',
      type: 'delivery', // New type to distinguish from original letters
      originalLetter: originalLetter._id,
      deliveredAt: new Date(),
      createdAt: new Date()
    });
    
    await deliveryLetter.save();
  }

  // Manual trigger for testing
  async triggerCycle() {
    console.log('🔄 Manually triggering letter cycle...');
    await this.cycleLetters();
  }

  // Get next cycle time
  getNextCycleTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return tomorrow;
  }

  // Get time until next cycle
  getTimeUntilNextCycle() {
    const now = new Date();
    const nextCycle = this.getNextCycleTime();
    const diff = nextCycle.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, totalMilliseconds: diff };
  }
}

export default new LetterCycleService();
