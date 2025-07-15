import User from '../models/User.js';

export const updateProfile = async (req, res) => {
  try {
    const { name, country, timezone, bio, interests } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!name || !country || !interests || interests.length < 3) {
      return res.status(400).json({
        message: 'Name, country, and at least 3 interests are required'
      });
    }

    // Validate interests count
    if (interests.length > 5) {
      return res.status(400).json({
        message: 'Maximum 5 interests are allowed'
      });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        country,
        timezone: timezone || null,
        bio: bio || null,
        interests,
        profileCompleted: true
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBasicProfile = async (req, res) => {
  try {
    const { name, country, interests } = req.body;
    const userId = req.user.userId;

    // Validate minimum required fields
    if (!name || !country || !interests || interests.length < 3) {
      return res.status(400).json({
        message: 'Name, country, and at least 3 interests are required'
      });
    }

    // Update user with basic profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        country,
        interests,
        profileCompleted: true
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Basic profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        name: user.name,
        country: user.country,
        timezone: user.timezone,
        bio: user.bio,
        interests: user.interests,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const checkProfileStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      profileCompleted: user.profileCompleted,
      hasBasicInfo: !!(user.name && user.country),
      hasInterests: user.interests && user.interests.length >= 3
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
