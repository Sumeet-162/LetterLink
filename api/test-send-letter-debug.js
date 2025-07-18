import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Letter from './src/models/Letter.js';
import User from './src/models/User.js';
import Friend from './src/models/Friend.js';

dotenv.config();

async function testSendLetterDebug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get test users
    const testUser = await User.findOne({ email: 'test@letterlink.com' });
    const marcus = await User.findOne({ email: 'marcus@letterlink.com' });

    if (!testUser || !marcus) {
      console.error('Test users not found');
      return;
    }

    console.log('Found users:', {
      testUser: testUser.username,
      marcus: marcus.username
    });

    // Check friendship
    let friendship = await Friend.findFriendship(testUser._id, marcus._id);
    console.log('Existing friendship:', friendship ? 'Yes' : 'No');
    
    const isFirstLetter = !friendship;
    console.log('Is first letter:', isFirstLetter);

    // Try to create letter with debug
    const letterData = {
      sender: testUser._id,
      recipient: marcus._id,
      subject: 'Hello from Test',
      content: 'This is a test letter to debug the issue.',
      deliveryDelay: 0,
      status: 'delivered',
      deliveredAt: new Date(),
      type: isFirstLetter ? 'friend_letter' : 'letter',
      isFirstLetter: isFirstLetter
    };

    // Only set friendRequestResponse for first letters
    if (isFirstLetter) {
      letterData.friendRequestResponse = 'pending';
    }

    console.log('Letter data to create:', letterData);

    // Try creating the letter
    const letter = new Letter(letterData);
    
    // Validate before saving
    const validationError = letter.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError.errors);
      return;
    }

    console.log('Letter validation passed, attempting to save...');
    
    const savedLetter = await letter.save();
    console.log('✅ Letter created successfully:', savedLetter._id);

  } catch (error) {
    console.error('❌ Error creating letter:', error);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.disconnect();
  }
}

testSendLetterDebug();
