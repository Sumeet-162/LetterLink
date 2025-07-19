import Letter from '../models/Letter.js';
import Friend from '../models/Friend.js';
import Draft from '../models/Draft.js';
import User from '../models/User.js';
import letterCycleService from '../services/letterCycleService.js';
import { calculateDeliveryDelay } from '../utils/deliveryCalculator.js';

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

    // Check if letter should be delivered (if time is up and status is still 'sent')
    if (letter.status === 'sent' && letter.scheduledDelivery && new Date() >= letter.scheduledDelivery) {
      letter.status = 'delivered';
      letter.deliveredAt = new Date();
      await letter.save();
    }

    // If recipient is trying to read a letter that's not yet delivered, deny access
    if (letter.recipient._id.toString() === userId && letter.status === 'sent') {
      const timeRemaining = letter.scheduledDelivery ? Math.max(0, letter.scheduledDelivery - new Date()) : 0;
      return res.status(423).json({ 
        message: 'Letter is still in transit',
        timeRemaining: timeRemaining,
        scheduledDelivery: letter.scheduledDelivery
      });
    }

    // Mark as read if recipient is viewing and letter is delivered
    if (letter.recipient._id.toString() === userId && letter.status === 'delivered') {
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

    // Get sender and recipient data
    const [sender, recipient] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId)
    ]);

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Check if they are already friends
    let friendship = await Friend.findFriendship(senderId, recipientId);
    const isFirstLetter = !friendship;

    // Calculate delivery delay based on countries
    let calculatedDeliveryDelay = deliveryDelay;
    
    if (deliveryDelay === 0) {
      // Auto-calculate based on countries and user preferences
      const userPreference = sender.letterPreferences?.deliveryDelay || null;
      calculatedDeliveryDelay = calculateDeliveryDelay(
        sender.country, 
        recipient.country, 
        userPreference
      );
    }

    console.log('Letter delivery calculation:', {
      senderCountry: sender.country,
      recipientCountry: recipient.country,
      calculatedDelay: calculatedDeliveryDelay,
      userPreference: sender.letterPreferences?.deliveryDelay
    });

    // Prepare letter data
    const letterData = {
      sender: senderId,
      recipient: recipientId,
      subject,
      content,
      deliveryDelay: calculatedDeliveryDelay,
      status: 'sent', // Starts as sent, will become 'delivered' when timer expires
      type: isFirstLetter ? 'friend_letter' : 'delivery',
      isFirstLetter: isFirstLetter
    };

    // Only set friendRequestResponse for friend letters
    if (isFirstLetter) {
      letterData.friendRequestResponse = 'pending';
    }

    // Create the letter
    const letter = await Letter.create(letterData);

    // Only create friendship if they're already friends (subsequent letters)
    if (friendship) {
      // Update existing friendship activity
      await friendship.updateActivity('sent', letter._id);
      friendship.letterCount += 1;
      await friendship.save();
    }
    // For first letters, friendship will be created only after acceptance

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

    console.log('Reply request received:', {
      letterId,
      senderId,
      subject,
      userFromToken: req.user
    });

    // Find the original letter with populated sender/recipient
    const originalLetter = await Letter.findById(letterId)
      .populate('sender', 'country letterPreferences')
      .populate('recipient', 'country letterPreferences');
      
    if (!originalLetter) {
      return res.status(404).json({ message: 'Original letter not found' });
    }

    console.log('Original letter found:', {
      letterSender: originalLetter.sender._id,
      letterRecipient: originalLetter.recipient._id,
      letterStatus: originalLetter.status,
      senderId,
      senderType: typeof senderId,
      recipientType: typeof originalLetter.recipient._id
    });

    // Check if user can reply (must be the recipient)
    // Note: When populated, originalLetter.recipient is an object with _id
    const canReplyCheck = originalLetter.recipient._id.toString() === senderId.toString() && 
                         originalLetter.status === 'read' && 
                         !originalLetter.isArchived;

    console.log('Checking canReply:', {
      canReply: canReplyCheck,
      originalCanReply: originalLetter.canReply(senderId),
      isRecipient: originalLetter.recipient._id.toString() === senderId.toString(),
      recipientId: originalLetter.recipient._id.toString(),
      senderId: senderId.toString(),
      status: originalLetter.status,
      isArchived: originalLetter.isArchived
    });

    if (!canReplyCheck) {
      return res.status(403).json({ message: 'Cannot reply to this letter' });
    }

    // Get sender data for delivery calculation
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Calculate delivery delay based on countries
    let calculatedDeliveryDelay = deliveryDelay;
    
    if (deliveryDelay === 0) {
      // Auto-calculate based on countries and user preferences
      const userPreference = sender.letterPreferences?.deliveryDelay || null;
      calculatedDeliveryDelay = calculateDeliveryDelay(
        sender.country, 
        originalLetter.sender.country, // Reply goes to original sender
        userPreference
      );
    }

    console.log('Reply delivery calculation:', {
      senderCountry: sender.country,
      recipientCountry: originalLetter.sender.country,
      calculatedDelay: calculatedDeliveryDelay,
      userPreference: sender.letterPreferences?.deliveryDelay
    });

    // Create the reply - delivered immediately
    const reply = await Letter.create({
      sender: senderId,
      recipient: originalLetter.sender._id,
      subject,
      content,
      type: 'reply',
      replyTo: letterId,
      status: 'delivered', // Immediately delivered to recipient's inbox
      deliveredAt: new Date(), // Delivered now
      deliveryDelay: calculatedDeliveryDelay // Keep for display purposes
    });

    // Create or update friendship activity
    let friendship = await Friend.findFriendship(senderId, originalLetter.sender);
    if (friendship) {
      // Update existing friendship
      await friendship.updateActivity('replied', reply._id);
      friendship.letterCount += 1;
      await friendship.save();
    } else {
      // Create new friendship when someone replies for the first time
      friendship = await Friend.create({
        user1: senderId,
        user2: originalLetter.sender._id,
        initiatedBy: senderId, // The person who replied initiated the friendship
        lastActivity: new Date(),
        lastActivityType: 'replied',
        lastLetter: reply._id,
        letterCount: 1,
        status: 'accepted' // Friendships are automatically accepted when someone replies
      });
      console.log('New friendship created:', friendship._id);
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

// Get matched recipients for letter writing preview
export const getMatchedRecipients = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      region, 
      countries, 
      ageGroup, 
      gender, 
      interests, 
      languages, 
      relationshipStatus, 
      writingStyle 
    } = req.query;
    
    // Get current user's profile
    const currentUser = await User.findById(userId);
    if (!currentUser || !currentUser.profileCompleted) {
      return res.status(400).json({ message: 'Profile must be completed first' });
    }

    // Get list of current friends to exclude
    const friendships = await Friend.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });
    
    const friendIds = friendships.map(friendship => 
      friendship.requester.toString() === userId ? friendship.recipient : friendship.requester
    );

    // Build query for potential recipients (same logic as sendRandomMatchLetter)
    let query = {
      _id: { 
        $ne: userId,
        $nin: friendIds // Exclude friends
      },
      profileCompleted: true
    };
    
    // Apply filters (same as in sendRandomMatchLetter)
    if (region && region !== 'worldwide') {
      if (region === 'custom' && countries) {
        const countryArray = Array.isArray(countries) ? countries : countries.split(',');
        query.country = { $in: countryArray };
      } else {
        // Define regional country groups
        const regionMaps = {
          'north-america': ['United States', 'Canada', 'Mexico'],
          'south-america': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Uruguay', 'Venezuela'],
          'europe': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Ireland', 'Finland'],
          'asia': ['Japan', 'China', 'South Korea', 'India', 'Singapore', 'Malaysia', 'Thailand', 'Philippines', 'Vietnam', 'Indonesia'],
          'africa': ['South Africa', 'Nigeria', 'Ghana', 'Kenya', 'Morocco', 'Ethiopia'],
          'oceania': ['Australia', 'New Zealand']
        };
        
        if (regionMaps[region]) {
          query.country = { $in: regionMaps[region] };
        }
      }
    }
    
    // Filter by age group
    if (ageGroup && ageGroup !== 'any') {
      const now = new Date();
      let minAge, maxAge;
      
      switch (ageGroup) {
        case '18-25': minAge = 18; maxAge = 25; break;
        case '26-35': minAge = 26; maxAge = 35; break;
        case '36-45': minAge = 36; maxAge = 45; break;
        case '46-55': minAge = 46; maxAge = 55; break;
        case '56-65': minAge = 56; maxAge = 65; break;
        case '65+': minAge = 65; maxAge = 120; break;
      }
      
      if (minAge && maxAge) {
        const maxDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
        const minDate = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate());
        query.dateOfBirth = { $gte: minDate, $lte: maxDate };
      }
    }
    
    // Filter by gender
    if (gender && gender !== 'any') {
      query.gender = gender;
    }
    
    // Filter by interests
    if (interests) {
      const interestArray = Array.isArray(interests) ? interests : interests.split(',');
      if (interestArray.length > 0) {
        query.interests = { $in: interestArray };
      }
    }
    
    // Filter by languages
    if (languages) {
      const languageArray = Array.isArray(languages) ? languages : languages.split(',');
      if (languageArray.length > 0) {
        query.languagesKnown = { $in: languageArray };
      }
    }
    
    // Filter by relationship status
    if (relationshipStatus && relationshipStatus !== 'any') {
      query.relationshipStatus = relationshipStatus;
    }
    
    // Filter by writing style
    if (writingStyle && writingStyle !== 'any') {
      query.writingStyle = writingStyle;
    }

    // Find potential recipients
    const matchedUsers = await User.find(query)
      .select('name country timezone interests languagesKnown dateOfBirth gender')
      .limit(10); // Show preview of potential matches

    // Calculate age and format response
    const formattedUsers = matchedUsers.map(user => {
      let age = null;
      if (user.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(user.dateOfBirth);
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      // Calculate estimated delivery time based on distance
      const deliveryDelay = calculateDeliveryDelay(currentUser.country, user.country);
      
      return {
        id: user._id,
        name: user.name,
        country: user.country,
        age: age,
        interests: user.interests?.slice(0, 3), // Show first 3 interests
        deliveryTime: deliveryDelay > 6 ? `${deliveryDelay} hours` : `${deliveryDelay * 60} minutes`,
        distance: user.country === currentUser.country ? 'Local' : 'International'
      };
    });

    res.json({
      matches: formattedUsers,
      totalFound: matchedUsers.length,
      appliedFilters: {
        region, countries, ageGroup, gender, interests, languages, relationshipStatus, writingStyle
      }
    });
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

// Send random match letter to 3 non-friend recipients
export const sendRandomMatchLetter = async (req, res) => {
  try {
    const { 
      subject, 
      content, 
      preferences = {} 
    } = req.body;
    const senderId = req.user.userId;
    
    // Validate input
    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }
    
    // Get current user
    const currentUser = await User.findById(senderId);
    if (!currentUser || !currentUser.profileCompleted) {
      return res.status(400).json({ message: 'Profile must be completed first' });
    }
    
    // Get list of current friends to exclude
    const friendships = await Friend.find({
      $or: [
        { requester: senderId, status: 'accepted' },
        { recipient: senderId, status: 'accepted' }
      ]
    });
    
    const friendIds = friendships.map(friendship => 
      friendship.requester.toString() === senderId ? friendship.recipient : friendship.requester
    );
    
    // Build query for potential recipients
    let query = {
      _id: { 
        $ne: senderId,
        $nin: friendIds // Exclude friends
      },
      profileCompleted: true
    };
    
    // Apply user preferences for targeting
    const { 
      region, 
      countries, 
      ageGroup, 
      gender, 
      interests, 
      languages, 
      relationshipStatus, 
      writingStyle 
    } = preferences;
    
    // Filter by region/countries
    if (region && region !== 'worldwide') {
      if (region === 'custom' && countries && countries.length > 0) {
        query.country = { $in: countries };
      } else {
        // Define regional country groups
        const regionMaps = {
          'north-america': ['United States', 'Canada', 'Mexico'],
          'south-america': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Uruguay', 'Venezuela'],
          'europe': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Ireland', 'Finland'],
          'asia': ['Japan', 'China', 'South Korea', 'India', 'Singapore', 'Malaysia', 'Thailand', 'Philippines', 'Vietnam', 'Indonesia'],
          'africa': ['South Africa', 'Nigeria', 'Ghana', 'Kenya', 'Morocco', 'Ethiopia'],
          'oceania': ['Australia', 'New Zealand']
        };
        
        if (regionMaps[region]) {
          query.country = { $in: regionMaps[region] };
        }
      }
    }
    
    // Filter by age group
    if (ageGroup && ageGroup !== 'any') {
      const now = new Date();
      let minAge, maxAge;
      
      switch (ageGroup) {
        case '18-25': minAge = 18; maxAge = 25; break;
        case '26-35': minAge = 26; maxAge = 35; break;
        case '36-45': minAge = 36; maxAge = 45; break;
        case '46-55': minAge = 46; maxAge = 55; break;
        case '56-65': minAge = 56; maxAge = 65; break;
        case '65+': minAge = 65; maxAge = 120; break;
      }
      
      if (minAge && maxAge) {
        const maxDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
        const minDate = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate());
        query.dateOfBirth = { $gte: minDate, $lte: maxDate };
      }
    }
    
    // Filter by gender
    if (gender && gender !== 'any') {
      query.gender = gender;
    }
    
    // Filter by interests (at least one matching interest)
    if (interests && interests.length > 0) {
      query.interests = { $in: interests };
    }
    
    // Filter by languages
    if (languages && languages.length > 0) {
      query.languagesKnown = { $in: languages };
    }
    
    // Filter by relationship status
    if (relationshipStatus && relationshipStatus !== 'any') {
      query.relationshipStatus = relationshipStatus;
    }
    
    // Filter by writing style
    if (writingStyle && writingStyle !== 'any') {
      query.writingStyle = writingStyle;
    }
    
    console.log('Finding recipients with query:', JSON.stringify(query, null, 2));
    
    // Find potential recipients
    const potentialRecipients = await User.find(query)
      .select('_id name country interests languagesKnown')
      .limit(100); // Get more to randomly select from
    
    if (potentialRecipients.length === 0) {
      return res.status(404).json({ 
        message: 'No users found matching your preferences. Try adjusting your filters.',
        appliedFilters: preferences
      });
    }
    
    // Randomly select 3 users (or less if not enough available)
    const shuffled = potentialRecipients.sort(() => 0.5 - Math.random());
    const selectedRecipients = shuffled.slice(0, Math.min(3, shuffled.length));
    
    console.log(`Selected ${selectedRecipients.length} recipients for letter delivery`);
    
    // Create and immediately deliver letters to each recipient
    const letters = [];
    const deliveryTime = new Date(); // Immediate delivery
    
    for (const recipient of selectedRecipients) {
      // Calculate delivery delay for display purposes
      const deliveryDelay = calculateDeliveryDelay(
        currentUser.country, 
        recipient.country || 'Unknown'
      );
      
      const letter = await Letter.create({
        sender: senderId,
        recipient: recipient._id,
        subject,
        content,
        type: 'delivery', // Mark as delivery letter for the 3-letter system
        status: 'delivered', // Immediately delivered to recipient's inbox
        deliveredAt: deliveryTime, // Delivered now
        deliveryDelay: deliveryDelay
      });
      
      letters.push({
        id: letter._id,
        recipient: {
          id: recipient._id,
          name: recipient.name,
          country: recipient.country
        },
        deliveredAt: deliveryTime,
        deliveryDelay: deliveryDelay
      });
    }
    
    res.json({ 
      success: true,
      message: `Letter delivered immediately to ${letters.length} recipient${letters.length !== 1 ? 's' : ''}`,
      recipientCount: letters.length,
      deliveryInfo: {
        deliveredAt: deliveryTime,
        message: 'Your letter has been delivered to recipients and is now in their inbox'
      },
      letters: letters
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

// Accept a friend letter (first letter between users)
export const acceptFriendLetter = async (req, res) => {
  try {
    const { letterId } = req.params;
    const userId = req.user.userId;

    // Find the letter
    const letter = await Letter.findById(letterId)
      .populate('sender', 'username name')
      .populate('recipient', 'username name');

    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Check if user is the recipient
    if (letter.recipient._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this letter' });
    }

    // Check if it's a friend letter
    if (!letter.isFirstLetter || letter.friendRequestResponse !== 'pending') {
      return res.status(400).json({ message: 'This letter cannot be accepted' });
    }

    // Update letter status
    letter.friendRequestResponse = 'accepted';
    letter.status = 'read';
    letter.respondedAt = new Date();
    letter.readAt = new Date();
    await letter.save();

    // Create friendship
    const friendship = await Friend.create({
      user1: letter.sender._id,
      user2: letter.recipient._id,
      initiatedBy: letter.sender._id,
      lastActivity: new Date(),
      lastActivityType: 'received', // Use 'received' instead of 'accepted'
      lastLetter: letter._id,
      letterCount: 1
    });

    res.json({ 
      message: 'Friend letter accepted successfully',
      letter: letter,
      friendship: friendship
    });

  } catch (error) {
    console.error('Error accepting friend letter:', error);
    res.status(500).json({ message: 'Error accepting friend letter' });
  }
};

// Reject a friend letter
export const rejectFriendLetter = async (req, res) => {
  try {
    const { letterId } = req.params;
    const userId = req.user.userId;

    // Find the letter
    const letter = await Letter.findById(letterId)
      .populate('sender', 'username name')
      .populate('recipient', 'username name');

    if (!letter) {
      return res.status(404).json({ message: 'Letter not found' });
    }

    // Check if user is the recipient
    if (letter.recipient._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this letter' });
    }

    // Check if it's a friend letter
    if (!letter.isFirstLetter || letter.friendRequestResponse !== 'pending') {
      return res.status(400).json({ message: 'This letter cannot be rejected' });
    }

    // Update letter status
    letter.friendRequestResponse = 'rejected';
    letter.status = 'archived'; // Remove from recipient's view
    letter.respondedAt = new Date();
    await letter.save();

    // TODO: Create notification for sender about rejection

    res.json({ 
      message: 'Friend letter rejected successfully',
      letter: letter
    });

  } catch (error) {
    console.error('Error rejecting friend letter:', error);
    res.status(500).json({ message: 'Error rejecting friend letter' });
  }
};

// Get pending friend letters (letters waiting for accept/reject)
export const getPendingFriendLetters = async (req, res) => {
  try {
    const userId = req.user.userId;

    const pendingLetters = await Letter.find({
      recipient: userId,
      isFirstLetter: true,
      friendRequestResponse: 'pending',
      status: { $in: ['delivered', 'read'] } // Only delivered letters can be responded to
    })
    .populate('sender', 'username name country profilePicture')
    .sort({ deliveredAt: -1 });

    res.json(pendingLetters);
  } catch (error) {
    console.error('Error fetching pending friend letters:', error);
    res.status(500).json({ message: 'Error fetching pending friend letters' });
  }
};

// Get user's incoming letters (letters in transit)
export const getIncomingLetters = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get letters that are sent but not yet delivered
    const letters = await Letter.find({
      recipient: userId,
      status: 'sent',
      scheduledDelivery: { $exists: true }
    })
    .populate('sender', 'username name profilePicture country timezone interests')
    .populate('recipient', 'username name profilePicture country timezone')
    .sort({ createdAt: -1 });

    // Add time remaining and format for frontend compatibility
    const lettersWithTimeRemaining = letters.map(letter => {
      const now = new Date();
      const scheduledTime = new Date(letter.scheduledDelivery);
      const timeRemaining = Math.max(0, scheduledTime - now);
      const isReadyForDelivery = timeRemaining === 0;
      
      // Format remaining time
      const formatRemainingTime = (ms) => {
        if (ms <= 0) return 'Ready to read!';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
          const remainingMinutes = minutes % 60;
          return `${hours}h ${remainingMinutes}m`;
        } else if (minutes > 0) {
          const remainingSeconds = seconds % 60;
          return `${minutes}m ${remainingSeconds}s`;
        } else {
          return `${seconds}s`;
        }
      };

      return {
        ...letter.toObject(),
        // Original fields
        timeRemaining: timeRemaining,
        canRead: isReadyForDelivery,
        // Frontend-compatible fields
        deliveryDate: letter.scheduledDelivery,
        sentAt: letter.createdAt,
        remainingTime: formatRemainingTime(timeRemaining),
        isReadyForDelivery: isReadyForDelivery,
        senderCountry: letter.sender?.country || 'Unknown',
        recipientCountry: letter.recipient?.country || 'Unknown',
        estimatedDeliveryText: isReadyForDelivery 
          ? 'Letter has arrived!' 
          : `Estimated delivery: ${formatRemainingTime(timeRemaining)}`
      };
    });

    res.json(lettersWithTimeRemaining);
  } catch (error) {
    console.error('Error fetching incoming letters:', error);
    res.status(500).json({ message: 'Error fetching incoming letters' });
  }
};

// Deliver letters that have reached their scheduled delivery time
export const deliverScheduledLetters = async (req, res) => {
  try {
    const now = new Date();
    
    // Find letters that are ready to be delivered
    const lettersToDeliver = await Letter.find({
      status: 'sent',
      scheduledDelivery: { $lte: now }
    });

    // Update their status to delivered
    for (const letter of lettersToDeliver) {
      letter.status = 'delivered';
      letter.deliveredAt = now;
      await letter.save();
    }

    res.json({ 
      message: `Delivered ${lettersToDeliver.length} letters`,
      deliveredCount: lettersToDeliver.length 
    });
  } catch (error) {
    console.error('Error delivering scheduled letters:', error);
    res.status(500).json({ message: 'Error delivering scheduled letters' });
  }
};
