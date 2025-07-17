import User from '../models/User.js';

export const updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      dateOfBirth, 
      gender, 
      relationshipStatus, 
      writingStyle, 
      languagesKnown, 
      country, 
      timezone, 
      bio, 
      interests 
    } = req.body;
    const userId = req.user.userId;

    // For profile completion, validate all required fields
    const isCompletingProfile = name && dateOfBirth && gender && relationshipStatus && 
                               writingStyle && languagesKnown && languagesKnown.length >= 1 && 
                               country && bio && interests && interests.length >= 3;

    if (isCompletingProfile) {
      // Validate interests count
      if (interests.length > 5) {
        return res.status(400).json({
          message: 'Maximum 5 interests are allowed'
        });
      }

      // Validate languages count
      if (languagesKnown.length > 5) {
        return res.status(400).json({
          message: 'Maximum 5 languages are allowed'
        });
      }

      // Update user profile with completion
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          name,
          dateOfBirth,
          gender,
          relationshipStatus,
          writingStyle,
          languagesKnown,
          country,
          timezone: timezone || null,
          bio,
          interests,
          profileCompleted: true
        },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'Profile completed successfully',
        user: updatedUser
      });
    } else {
      // Partial update - only update provided fields
      const updateFields = {};
      if (name) updateFields.name = name;
      if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
      if (gender) updateFields.gender = gender;
      if (relationshipStatus) updateFields.relationshipStatus = relationshipStatus;
      if (writingStyle) updateFields.writingStyle = writingStyle;
      if (languagesKnown) updateFields.languagesKnown = languagesKnown;
      if (country) updateFields.country = country;
      if (timezone) updateFields.timezone = timezone;
      if (bio) updateFields.bio = bio;
      if (interests) updateFields.interests = interests;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    }
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
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        relationshipStatus: user.relationshipStatus,
        writingStyle: user.writingStyle,
        languagesKnown: user.languagesKnown,
        age: user.age, // virtual field
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

    const hasCompleteProfile = !!(
      user.name && 
      user.dateOfBirth && 
      user.gender && 
      user.relationshipStatus && 
      user.writingStyle && 
      user.languagesKnown && user.languagesKnown.length >= 1 &&
      user.country && 
      user.bio && 
      user.interests && user.interests.length >= 3
    );

    res.status(200).json({
      profileCompleted: user.profileCompleted && hasCompleteProfile,
      hasBasicInfo: !!(user.name && user.country),
      hasPersonalInfo: !!(user.dateOfBirth && user.gender && user.relationshipStatus && user.writingStyle),
      hasLanguages: user.languagesKnown && user.languagesKnown.length >= 1,
      hasInterests: user.interests && user.interests.length >= 3,
      hasBio: !!user.bio
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
