import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

// Test users
const userA = { email: 'test@letterlink.com', password: 'password123' }; // testuser
const userB = { email: 'yuki@letterlink.com', password: 'password123' }; // yuki

let tokenA = '';
let tokenB = '';

// Helper functions
const clearExistingRelationship = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = (await import('./src/models/User.js')).default;
  const Friend = (await import('./src/models/Friend.js')).default;
  const Letter = (await import('./src/models/Letter.js')).default;
  
  const userADoc = await User.findOne({ email: userA.email });
  const userBDoc = await User.findOne({ email: userB.email });
  
  if (userADoc && userBDoc) {
    await Friend.deleteMany({
      $or: [
        { user1: userADoc._id, user2: userBDoc._id },
        { user1: userBDoc._id, user2: userADoc._id }
      ]
    });
    
    await Letter.deleteMany({
      $or: [
        { sender: userADoc._id, recipient: userBDoc._id },
        { sender: userBDoc._id, recipient: userADoc._id }
      ]
    });
  }
  
  await mongoose.disconnect();
};

const login = async (credentials) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return (await response.json()).token;
};

const searchUsers = async (token, query) => {
  const response = await fetch(`${API_BASE}/friends/search?q=${encodeURIComponent(query)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

const sendLetter = async (token, letterData) => {
  const response = await fetch(`${API_BASE}/letters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(letterData)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Send letter failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};

const getIncomingLetters = async (token) => {
  const response = await fetch(`${API_BASE}/letters/incoming`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

const deliverScheduledLetters = async (token) => {
  const response = await fetch(`${API_BASE}/letters/deliver-scheduled`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

const getPendingFriendLetters = async (token) => {
  const response = await fetch(`${API_BASE}/letters/pending-friend-letters`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

const acceptFriendLetter = async (token, letterId) => {
  const response = await fetch(`${API_BASE}/letters/${letterId}/accept`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

const getFriends = async (token) => {
  const response = await fetch(`${API_BASE}/friends`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

async function testCompleteWorkflow() {
  try {
    console.log('🚀 Testing Complete Friend Letter Workflow with Fresh Users');

    // Step 0: Clear any existing relationship
    console.log('0. Clearing existing relationship...');
    await clearExistingRelationship();
    console.log('✅ Cleared existing relationship and letters');

    // Step 1: Login both users
    console.log('1. Logging in both users...');
    tokenA = await login(userA);
    tokenB = await login(userB);
    console.log('✅ Both users logged in');

    // Step 2: UserA searches for Yuki
    console.log('2. UserA searching for Yuki...');
    const searchResults = await searchUsers(tokenA, 'yuki');
    console.log('Search results:', JSON.stringify(searchResults, null, 2));
    
    if (searchResults.length === 0) {
      throw new Error('Yuki not found in search results');
    }
    const yuki = searchResults.find(user => user.email === userB.email || user.username === 'yuki_kyoto');
    console.log('Found Yuki:', yuki);
    
    if (!yuki) {
      throw new Error('Yuki not found in search results');
    }
    console.log(`✅ Found Yuki: ${yuki.name || yuki.username} from ${yuki.country}`);

    // Step 3: UserA sends first letter to Yuki
    console.log('3. UserA sending first letter to Yuki...');
    const letterData = {
      recipientId: yuki._id,
      subject: 'Hello from Test User!',
      content: 'Hi Yuki! I saw your profile and thought we might have some common interests. I love mindfulness and nature. Would love to connect!',
      deliveryDelay: 0.01 // 0.6 minutes (36 seconds) for testing - simulating local delivery
    };

    const letterResponse = await sendLetter(tokenA, letterData);
    console.log('Letter details:', {
      id: letterResponse._id,
      type: letterResponse.type,
      isFirstLetter: letterResponse.isFirstLetter,
      status: letterResponse.status,
      scheduledDelivery: letterResponse.scheduledDelivery,
      deliveryDelay: letterResponse.deliveryDelay
    });
    console.log('✅ Letter sent successfully');

    // Step 4: Yuki checks for incoming letters (should see it immediately)
    console.log('4. Yuki checking for incoming letters...');
    const incomingLetters = await getIncomingLetters(tokenB);
    console.log(`Found ${incomingLetters.length} incoming letters`);
    
    if (incomingLetters.length === 0) {
      console.log('❌ No incoming letters found');
      return;
    }
    
    const incomingLetter = incomingLetters[0];
    console.log(`✅ Found incoming letter from ${incomingLetter.sender.name}: "${incomingLetter.subject}"`);
    console.log(`Time remaining: ${Math.ceil(incomingLetter.timeRemaining / 1000)} seconds`);

    // Step 5: Wait for delivery time and then deliver
    console.log('5. Waiting for delivery time...');
    if (incomingLetter.timeRemaining > 0) {
      console.log(`Waiting ${Math.ceil(incomingLetter.timeRemaining / 1000)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, incomingLetter.timeRemaining + 1000)); // Wait + 1 second buffer
    }
    
    // Trigger delivery
    await deliverScheduledLetters(tokenB);
    console.log('✅ Letters delivered');

    // Step 6: Yuki checks for pending friend letters
    console.log('6. Yuki checking for pending friend letters...');
    const pendingLetters = await getPendingFriendLetters(tokenB);
    console.log(`Found ${pendingLetters.length} pending friend letters`);
    
    if (pendingLetters.length === 0) {
      console.log('❌ No pending friend letters found - the letter might not have been processed correctly');
      return;
    }

    const friendLetter = pendingLetters[0];
    console.log(`✅ Found friend letter from ${friendLetter.sender.name}: "${friendLetter.subject}"`);

    // Step 7: Yuki accepts the friend letter
    console.log('7. Yuki accepting the friend letter...');
    const acceptResponse = await acceptFriendLetter(tokenB, friendLetter._id);
    console.log('✅ Friend letter accepted');

    // Step 8: Verify friendship was created
    console.log('8. Verifying friendship was created...');
    const userAFriends = await getFriends(tokenA);
    const userBFriends = await getFriends(tokenB);
    
    console.log(`UserA friends: ${userAFriends.length}`);
    console.log(`UserB friends: ${userBFriends.length}`);
    
    if (userAFriends.length > 0 && userBFriends.length > 0) {
      console.log('✅ Friendship created successfully!');
      console.log(`UserA has ${userAFriends.length} friends`);
      console.log(`UserB has ${userBFriends.length} friends`);
      
      // Try to show friend names if available
      if (userAFriends[0] && userAFriends[0].friend) {
        console.log(`UserA is friends with: ${userAFriends.map(f => f.friend.name || f.friend.username).join(', ')}`);
      }
      if (userBFriends[0] && userBFriends[0].friend) {
        console.log(`UserB is friends with: ${userBFriends.map(f => f.friend.name || f.friend.username).join(', ')}`);
      }
    } else {
      console.log('❌ Friendship was not created properly');
    }

    console.log('\n🎉 Complete friend letter workflow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteWorkflow();
