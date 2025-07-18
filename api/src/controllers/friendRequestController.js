import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';
import Letter from '../models/Letter.js';
import Friend from '../models/Friend.js';
import InTransitLetter from '../models/InTransitLetter.js';
import { calculateTestDeliveryTime } from '../utils/deliveryTime.js';

// Send a friend request with a letter
export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId, subject, content } = req.body;
    const senderId = req.user.userId;

    // Validate input
    if (!recipientId || !subject || !content) {
      return res.status(400).json({ 
        message: 'Recipient, subject, and content are required' 
      });
    }

    if (content.length < 50) {
      return res.status(400).json({ 
        message: 'Letter content must be at least 50 characters long' 
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.profileCompleted) {
      return res.status(404).json({ 
        message: 'Recipient not found or profile not completed' 
      });
    }

    // Prevent sending to yourself
    if (senderId === recipientId) {
      return res.status(400).json({ 
        message: 'Cannot send friend request to yourself' 
      });
    }

    // Check if already friends
    const existingFriendship = await Friend.findOne({
      $or: [
        { user1: senderId, user2: recipientId },
        { user1: recipientId, user2: senderId }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ 
        message: 'You are already friends with this user' 
      });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ],
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'Friend request already pending between you and this user' 
      });
    }

    // Get sender information
    const sender = await User.findById(senderId);
    if (!sender || !sender.profileCompleted) {
      return res.status(400).json({ 
        message: 'Your profile must be completed to send friend requests' 
      });
    }

    // Calculate delivery time based on countries
    const deliveryInfo = calculateTestDeliveryTime(sender.country, recipient.country);

    // Create the letter first
    const letter = await Letter.create({
      sender: senderId,
      recipient: recipientId,
      subject,
      content,
      letterType: 'friend_request'
    });

    // Create the friend request
    const friendRequest = await FriendRequest.create({
      sender: senderId,
      recipient: recipientId,
      letter: letter._id,
      status: 'pending',
      isDelivered: false // Will be set to true when delivery time passes
    });

    // Create in-transit letter entry
    await InTransitLetter.create({
      sender: senderId,
      recipient: recipientId,
      letter: letter._id,
      friendRequest: friendRequest._id,
      senderCountry: sender.country,
      recipientCountry: recipient.country,
      deliveryTimeMinutes: deliveryInfo.deliveryTimeMinutes,
      deliveryTimeDays: deliveryInfo.deliveryTimeDays,
      estimatedDeliveryText: deliveryInfo.estimatedDeliveryText,
      deliveryDate: deliveryInfo.deliveryDate,
      letterType: 'friend_request'
    });

    // Populate sender details for response
    await friendRequest.populate('sender', 'username name');
    
    res.status(201).json({
      message: 'Friend request sent successfully',
      request: friendRequest,
      deliveryInfo: {
        estimatedDelivery: deliveryInfo.estimatedDeliveryText,
        deliveryDate: deliveryInfo.deliveryDate,
        message: `Your letter will arrive in ${deliveryInfo.estimatedDeliveryText}`
      }
    });

  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get friend requests for current user
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get pending requests received by the user that have been delivered
    const receivedRequests = await FriendRequest.find({
      recipient: userId,
      status: 'pending',
      isDelivered: true // Only show delivered requests
    })
    .populate('sender', 'username name country interests writingStyle')
    .populate('letter', 'subject content')
    .sort({ deliveredAt: -1 });

    // Get pending requests sent by the user
    const sentRequests = await FriendRequest.find({
      sender: userId,
      status: 'pending'
    })
    .populate('recipient', 'username name country interests writingStyle')
    .sort({ sentAt: -1 });

    res.json({
      received: receivedRequests,
      sent: sentRequests
    });

  } catch (error) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId)
      .populate('sender', 'username name')
      .populate('recipient', 'username name')
      .populate('letter', 'subject content'); // Add letter population

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Check if user is the recipient
    if (friendRequest.recipient._id.toString() !== userId) {
      return res.status(403).json({ 
        message: 'You can only accept requests sent to you' 
      });
    }

    // Check if request is still pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ 
        message: 'This request has already been responded to' 
      });
    }

    // Use the existing letter from the friend request
    const existingLetter = friendRequest.letter;
    
    // Update the existing letter status to indicate it's been accepted
    existingLetter.status = 'read';
    existingLetter.readAt = new Date();
    await existingLetter.save();

    // Check if friendship already exists
    const existingFriendship = await Friend.findOne({
      $or: [
        { user1: friendRequest.sender._id, user2: friendRequest.recipient._id },
        { user1: friendRequest.recipient._id, user2: friendRequest.sender._id }
      ]
    });

    let friendship;
    if (existingFriendship) {
      // Update existing friendship
      existingFriendship.lastActivity = new Date();
      existingFriendship.lastActivityType = 'received';
      existingFriendship.lastLetter = existingLetter._id;
      existingFriendship.letterCount += 1;
      friendship = await existingFriendship.save();
    } else {
      // Create new friendship
      friendship = await Friend.create({
        user1: friendRequest.sender._id,
        user2: friendRequest.recipient._id,
        initiatedBy: friendRequest.sender._id,
        lastActivity: new Date(),
        lastActivityType: 'received',
        lastLetter: existingLetter._id,
        letterCount: 1
      });
    }

    // Update the friend request
    friendRequest.status = 'accepted';
    friendRequest.respondedAt = new Date();
    friendRequest.letterCreated = existingLetter._id;
    await friendRequest.save();

    res.json({
      message: 'Friend request accepted successfully',
      friendship,
      letter: existingLetter
    });

  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reject a friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Check if user is the recipient
    if (friendRequest.recipient.toString() !== userId) {
      return res.status(403).json({ 
        message: 'You can only reject requests sent to you' 
      });
    }

    // Check if request is still pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ 
        message: 'This request has already been responded to' 
      });
    }

    // Update the friend request
    friendRequest.status = 'rejected';
    friendRequest.respondedAt = new Date();
    await friendRequest.save();

    res.json({
      message: 'Friend request rejected'
    });

  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get friend request status for sent requests
export const getRequestStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get status of sent requests
    const sentRequests = await FriendRequest.find({
      sender: userId
    })
    .populate('recipient', 'username name')
    .sort({ sentAt: -1 });

    const statusCounts = {
      pending: sentRequests.filter(r => r.status === 'pending').length,
      accepted: sentRequests.filter(r => r.status === 'accepted').length,
      rejected: sentRequests.filter(r => r.status === 'rejected').length
    };

    res.json({
      requests: sentRequests,
      statusCounts
    });

  } catch (error) {
    console.error('Error getting request status:', error);
    res.status(500).json({ message: error.message });
  }
};
