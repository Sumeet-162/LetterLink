import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Letter from './src/models/Letter.js';
import User from './src/models/User.js';
import Friend from './src/models/Friend.js';

dotenv.config();

async function testWithFreshUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get two users who definitely don't have a relationship
    const testUser = await User.findOne({ email: 'test@letterlink.com' });
    const yuki = await User.findOne({ email: 'yuki@letterlink.com' });

    if (!testUser || !yuki) {
      console.error('Test users not found');
      return;
    }

    console.log('Testing with:', {
      testUser: testUser.username,
      yuki: yuki.username
    });

    // Clear any existing friendship
    await Friend.deleteMany({
      $or: [
        { user1: testUser._id, user2: yuki._id },
        { user1: yuki._id, user2: testUser._id }
      ]
    });

    // Clear any existing letters between them
    await Letter.deleteMany({
      $or: [
        { sender: testUser._id, recipient: yuki._id },
        { sender: yuki._id, recipient: testUser._id }
      ]
    });

    console.log('Cleared existing relationship and letters');

    // Check friendship now
    let friendship = await Friend.findFriendship(testUser._id, yuki._id);
    console.log('Existing friendship after cleanup:', friendship ? 'Yes' : 'No');
    
    const isFirstLetter = !friendship;
    console.log('Is first letter:', isFirstLetter);

    // Try to create letter with debug
    const letterData = {
      sender: testUser._id,
      recipient: yuki._id,
      subject: 'Hello from Test to Yuki',
      content: 'Hi Yuki! This should be our first letter and create a friend request.',
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
    const letter = await Letter.create(letterData);
    console.log('✅ Letter created successfully:', letter._id);

    // Verify the letter
    const savedLetter = await Letter.findById(letter._id);
    console.log('Saved letter details:', {
      type: savedLetter.type,
      isFirstLetter: savedLetter.isFirstLetter,
      friendRequestResponse: savedLetter.friendRequestResponse,
      status: savedLetter.status
    });

    // Check for pending friend letters
    const pendingLetters = await Letter.find({
      recipient: yuki._id,
      type: 'friend_letter',
      friendRequestResponse: 'pending',
      status: 'delivered'
    }).populate('sender', 'username name profilePicture country interests');

    console.log('Pending friend letters found:', pendingLetters.length);
    if (pendingLetters.length > 0) {
      console.log('Pending letter details:', pendingLetters[0]);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testWithFreshUsers();
