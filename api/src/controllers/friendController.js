import Friend from '../models/Friend.js';
import User from '../models/User.js';
import Letter from '../models/Letter.js';

// Search for users to potentially befriend
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.userId;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters long' });
    }

    // Search for users by name, username, country, or interests
    const searchRegex = new RegExp(q, 'i');
    const users = await User.find({
      _id: { $ne: userId }, // Exclude current user
      $or: [
        { name: searchRegex },
        { username: searchRegex },
        { country: searchRegex },
        { interests: { $in: [searchRegex] } }
      ]
    })
    .select('username name profilePicture country timezone bio interests lastSeen')
    .limit(20);

    // Check friendship status for each user
    const usersWithFriendshipStatus = await Promise.all(
      users.map(async (user) => {
        const friendship = await Friend.findFriendship(userId, user._id);
        return {
          _id: user._id,
          username: user.username,
          name: user.name,
          profilePicture: user.profilePicture,
          country: user.country,
          timezone: user.timezone,
          bio: user.bio,
          interests: user.interests,
          lastSeen: user.lastSeen,
          isFriend: !!friendship,
          letterCount: friendship ? friendship.letterCount : 0
        };
      })
    );

    res.json(usersWithFriendshipStatus);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};

// Get user's friends list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const friendships = await Friend.getFriends(userId);
    
    // Transform the data to include friend info and activity status
    const friends = friendships.map(friendship => {
      const friend = friendship.getOtherUser(userId);
      
      return {
        _id: friend._id,
        username: friend.username,
        name: friend.name,
        profilePicture: friend.profilePicture,
        country: friend.country,
        timezone: friend.timezone,
        lastSeen: friend.lastSeen,
        letterCount: friendship.letterCount,
        lastActivity: friendship.lastActivity,
        lastActivityType: friendship.lastActivityType,
        lastLetter: friendship.lastLetter
      };
    });

    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Error fetching friends' });
  }
};

// Get friend details
export const getFriendDetails = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    // Check if friendship exists
    const friendship = await Friend.findFriendship(userId, friendId);
    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Get friend's profile
    const friend = await User.findById(friendId)
      .select('username name profilePicture country timezone bio interests lastSeen');

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    // Get latest letter that can be replied to
    const latestLetter = await Letter.findOne({
      sender: friendId,
      recipient: userId,
      status: 'read'
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'username name profilePicture');

    // Check if there's already a reply to the latest letter
    let canReply = false;
    if (latestLetter) {
      const replyExists = await Letter.findOne({
        sender: userId,
        recipient: friendId,
        replyTo: latestLetter._id
      });
      canReply = !replyExists;
    }

    res.json({
      friend,
      friendship: {
        letterCount: friendship.letterCount,
        lastActivity: friendship.lastActivity,
        lastActivityType: friendship.lastActivityType,
        createdAt: friendship.createdAt
      },
      latestLetter,
      canReply
    });
  } catch (error) {
    console.error('Error fetching friend details:', error);
    res.status(500).json({ message: 'Error fetching friend details' });
  }
};

// Add a new friend (create friendship)
export const addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.userId;

    if (userId === friendId) {
      return res.status(400).json({ message: 'Cannot add yourself as a friend' });
    }

    // Check if friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if friendship already exists
    const existingFriendship = await Friend.findFriendship(userId, friendId);
    if (existingFriendship) {
      return res.status(400).json({ message: 'Friendship already exists' });
    }

    // Create friendship
    const friendship = await Friend.create({
      user1: userId,
      user2: friendId,
      initiatedBy: userId
    });

    const populatedFriendship = await Friend.findById(friendship._id)
      .populate('user1', 'username name profilePicture')
      .populate('user2', 'username name profilePicture');

    res.status(201).json(populatedFriendship);
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ message: 'Error adding friend' });
  }
};

// Remove a friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    const friendship = await Friend.findFriendship(userId, friendId);
    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Archive the friendship instead of deleting
    friendship.isArchived = true;
    await friendship.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ message: 'Error removing friend' });
  }
};

// Block a friend
export const blockFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    const friendship = await Friend.findFriendship(userId, friendId);
    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    friendship.status = 'blocked';
    await friendship.save();

    res.json({ message: 'Friend blocked successfully' });
  } catch (error) {
    console.error('Error blocking friend:', error);
    res.status(500).json({ message: 'Error blocking friend' });
  }
};

// Unblock a friend
export const unblockFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    const friendship = await Friend.findOne({
      $or: [
        { user1: userId, user2: friendId },
        { user1: friendId, user2: userId }
      ],
      status: 'blocked'
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Blocked friendship not found' });
    }

    friendship.status = 'accepted';
    await friendship.save();

    res.json({ message: 'Friend unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking friend:', error);
    res.status(500).json({ message: 'Error unblocking friend' });
  }
};

// Get friend's time and weather info
export const getFriendTimeWeather = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    // Check if friendship exists
    const friendship = await Friend.findFriendship(userId, friendId);
    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    // Get friend's timezone info
    const friend = await User.findById(friendId)
      .select('timezone country lastSeen');

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    // Calculate current time in friend's timezone
    const friendTime = friend.timezone ? 
      new Date().toLocaleString('en-US', { timeZone: friend.timezone }) : 
      new Date().toLocaleString();

    // Mock weather data (in production, you'd integrate with a weather API)
    const weatherData = {
      temperature: Math.floor(Math.random() * 25) + 15, // 15-40°C
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    };

    res.json({
      currentTime: friendTime,
      timezone: friend.timezone,
      country: friend.country,
      weather: weatherData,
      lastSeen: friend.lastSeen
    });
  } catch (error) {
    console.error('Error fetching friend time/weather:', error);
    res.status(500).json({ message: 'Error fetching friend information' });
  }
};
