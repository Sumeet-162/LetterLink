import Letter from '../models/Letter.js';
import Friend from '../models/Friend.js';
import Draft from '../models/Draft.js';
import User from '../models/User.js';
import letterCycleService from '../services/letterCycleService.js';

// Get user's inbox (received letters)
export const getInbox = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Only get current letters (delivered or read, not archived)
    const letters = await Letter.find({
      recipient: userId,
      status: { $in: ['delivered', 'read'] },
      type: { $in: ['delivery', 'reply'] } // Only delivery letters and direct replies
    })
    .populate('sender', 'username name profilePicture country timezone interests')
    .sort({ deliveredAt: -1 })
    .limit(6); // Limit to current cycle letters

    res.json(letters);
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ message: 'Error fetching inbox' });
  }
};

// Get user's sent letters
export const getSentLetters = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const letters = await Letter.find({
      sender: userId,
      isArchived: false
    })
    .populate('recipient', 'username name profilePicture country timezone')
    .sort({ createdAt: -1 });

    res.json(letters);
  } catch (error) {
    console.error('Error fetching sent letters:', error);
    res.status(500).json({ message: 'Error fetching sent letters' });
  }
};

// Get letter by ID
export const getLetterById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const letter = await Letter.findById(id)
      .populate('sender', 'username name profilePicture country timezone')
      .populate('recipient', 'username name profilePicture country timezone')
      .populate('replyTo', 'subject createdAt content');

    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Check if user has permission to view this letter
    if (letter.sender._id.toString() !== userId && letter.recipient._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this letter' });
    }

    // Mark as read if recipient is viewing
    if (letter.recipient._id.toString() === userId && letter.status !== 'read') {
      letter.markAsRead();
      await letter.save();
    }

    res.json(letter);
  } catch (error) {
    console.error('Error fetching letter:', error);
    res.status(500).json({ message: 'Error fetching letter' });
  }
};

// Send a new letter
export const sendLetter = async (req, res) => {
  try {
    const { recipientId, subject, content, deliveryDelay = 0 } = req.body;
    const senderId = req.user.userId;

    // Validate input
    if (!recipientId || !subject || !content) {
      return res.status(400).json({ message: 'Recipient, subject, and content are required' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create the letter
    const letter = await Letter.create({
      sender: senderId,
      recipient: recipientId,
      subject,
      content,
      deliveryDelay,
      status: deliveryDelay > 0 ? 'sent' : 'delivered'
    });

    // Create or update friendship
    let friendship = await Friend.findFriendship(senderId, recipientId);
    if (!friendship) {
      friendship = await Friend.create({
        user1: senderId,
        user2: recipientId,
        initiatedBy: senderId
      });
    }

    // Update friendship activity
    await friendship.updateActivity('sent', letter._id);
    friendship.letterCount += 1;
    await friendship.save();

    // Remove any completed drafts for this recipient
    await Draft.updateMany(
      { author: senderId, recipient: recipientId, isCompleted: false },
      { isCompleted: true, completedAt: new Date() }
    );

    const populatedLetter = await Letter.findById(letter._id)
      .populate('sender', 'username name profilePicture')
      .populate('recipient', 'username name profilePicture');

    res.status(201).json(populatedLetter);
  } catch (error) {
    console.error('Error sending letter:', error);
    res.status(500).json({ message: 'Error sending letter' });
  }
};

// Reply to a letter
export const replyToLetter = async (req, res) => {
  try {
    const { letterId, subject, content, deliveryDelay = 0 } = req.body;
    const senderId = req.user.userId;

    // Find the original letter
    const originalLetter = await Letter.findById(letterId);
    if (!originalLetter) {
      return res.status(404).json({ message: 'Original letter not found' });
    }

    // Check if user can reply (must be the recipient)
    if (!originalLetter.canReply(senderId)) {
      return res.status(403).json({ message: 'Cannot reply to this letter' });
    }

    // Create the reply
    const reply = await Letter.create({
      sender: senderId,
      recipient: originalLetter.sender,
      subject,
      content,
      type: 'reply',
      replyTo: letterId,
      deliveryDelay,
      status: deliveryDelay > 0 ? 'sent' : 'delivered'
    });

    // Update friendship activity
    const friendship = await Friend.findFriendship(senderId, originalLetter.sender);
    if (friendship) {
      await friendship.updateActivity('replied', reply._id);
      friendship.letterCount += 1;
      await friendship.save();
    }

    // Mark any draft as completed
    await Draft.updateMany(
      { author: senderId, replyTo: letterId, isCompleted: false },
      { isCompleted: true, completedAt: new Date() }
    );

    const populatedReply = await Letter.findById(reply._id)
      .populate('sender', 'username name profilePicture')
      .populate('recipient', 'username name profilePicture')
      .populate('replyTo', 'subject createdAt');

    res.status(201).json(populatedReply);
  } catch (error) {
    console.error('Error replying to letter:', error);
    res.status(500).json({ message: 'Error replying to letter' });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    // Check if friendship exists
    const friendship = await Friend.findFriendship(userId, friendId);
    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Get all letters between these users
    const letters = await Letter.find({
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId }
      ],
      isArchived: false
    })
    .populate('sender', 'username name profilePicture')
    .populate('recipient', 'username name profilePicture')
    .sort({ createdAt: -1 });

    res.json(letters);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Error fetching conversation' });
  }
};

// Get matched recipients for letter writing
export const getMatchedRecipients = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get current user's profile
    const currentUser = await User.findById(userId);
    if (!currentUser || !currentUser.profileCompleted) {
      return res.status(400).json({ message: 'Profile must be completed first' });
    }

    // Find users with similar interests (at least 1 common interest)
    const matchedUsers = await User.find({
      _id: { $ne: userId },
      profileCompleted: true,
      interests: { $in: currentUser.interests }
    })
    .select('username name country timezone interests profilePicture')
    .limit(20);

    res.json(matchedUsers);
  } catch (error) {
    console.error('Error fetching matched recipients:', error);
    res.status(500).json({ message: 'Error fetching matched recipients' });
  }
};

// Archive a letter
export const archiveLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const letter = await Letter.findById(id);
    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Check if user owns this letter
    if (letter.sender.toString() !== userId && letter.recipient.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to archive this letter' });
    }

    letter.isArchived = true;
    await letter.save();

    res.json({ message: 'Letter archived successfully' });
  } catch (error) {
    console.error('Error archiving letter:', error);
    res.status(500).json({ message: 'Error archiving letter' });
  }
};

// Mark letter as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const letter = await Letter.findById(id);
    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }
    
    // Check if user is the recipient
    if (letter.recipient.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to mark this letter as read' });
    }
    
    // Mark as read if not already read
    if (letter.status !== 'read') {
      letter.markAsRead();
      await letter.save();
    }
    
    res.json({ message: 'Letter marked as read' });
  } catch (error) {
    console.error('Error marking letter as read:', error);
    res.status(500).json({ message: 'Error marking letter as read' });
  }
};

// Send random match letter
export const sendRandomMatchLetter = async (req, res) => {
  try {
    const { subject, content, interests } = req.body;
    const senderId = req.user.userId;
    
    // Validate input
    if (!subject || !content || !interests || interests.length === 0) {
      return res.status(400).json({ message: 'Subject, content, and interests are required' });
    }
    
    // Get current user
    const currentUser = await User.findById(senderId);
    if (!currentUser || !currentUser.profileCompleted) {
      return res.status(400).json({ message: 'Profile must be completed first' });
    }
    
    // Find 3 random users with matching interests
    const matchedUsers = await User.find({
      _id: { $ne: senderId },
      profileCompleted: true,
      interests: { $in: interests }
    })
    .select('_id')
    .limit(50); // Get more to randomly select from
    
    if (matchedUsers.length === 0) {
      return res.status(404).json({ message: 'No users found with matching interests' });
    }
    
    // Randomly select 3 users (or less if not enough available)
    const shuffled = matchedUsers.sort(() => 0.5 - Math.random());
    const selectedRecipients = shuffled.slice(0, Math.min(3, shuffled.length));
    
    // Create letters for each recipient
    const letters = [];
    for (const recipient of selectedRecipients) {
      const letter = await Letter.create({
        sender: senderId,
        recipient: recipient._id,
        subject,
        content,
        type: 'letter',
        deliveryDelay: Math.floor(Math.random() * 24) + 1 // Random 1-24 hour delay
      });
      letters.push(letter);
    }
    
    res.json({ 
      message: `Letter sent to ${letters.length} recipient${letters.length !== 1 ? 's' : ''}`,
      recipientCount: letters.length,
      letters: letters.map(l => l._id)
    });
  } catch (error) {
    console.error('Error sending random match letter:', error);
    res.status(500).json({ message: 'Error sending random match letter' });
  }
};

// Get next cycle information
export const getNextCycleInfo = async (req, res) => {
  try {
    const timeUntilNext = letterCycleService.getTimeUntilNextCycle();
    const nextCycleTime = letterCycleService.getNextCycleTime();
    
    res.json({
      nextCycleAt: nextCycleTime,
      timeRemaining: {
        hours: timeUntilNext.hours,
        minutes: timeUntilNext.minutes,
        seconds: timeUntilNext.seconds,
        totalMilliseconds: timeUntilNext.totalMilliseconds
      }
    });
  } catch (error) {
    console.error('Error getting cycle info:', error);
    res.status(500).json({ message: 'Error getting cycle information' });
  }
};

// Manual trigger for testing (admin only)
export const triggerLetterCycle = async (req, res) => {
  try {
    // In production, add admin authentication check here
    await letterCycleService.triggerCycle();
    res.json({ message: 'Letter cycle triggered successfully' });
  } catch (error) {
    console.error('Error triggering cycle:', error);
    res.status(500).json({ message: 'Error triggering letter cycle' });
  }
};

// Get archived letters for a user
export const getArchivedLetters = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const letters = await Letter.find({
      recipient: userId,
      status: 'archived'
    })
    .populate('sender', 'username name profilePicture country timezone interests')
    .sort({ archivedAt: -1 })
    .limit(50); // Limit to recent 50 archived letters

    res.json(letters);
  } catch (error) {
    console.error('Error fetching archived letters:', error);
    res.status(500).json({ message: 'Error fetching archived letters' });
  }
};
