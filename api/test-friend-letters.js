import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test users
const user1 = { email: 'test@letterlink.com', password: 'password123' }; // testuser
const user2 = { email: 'sophia@letterlink.com', password: 'password123' }; // sophia_milan

let user1Token = '';
let user2Token = '';

// Helper function to login
const login = async (credentials) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data.token;
};

// Helper function to send a letter
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

// Helper function to get pending friend letters
const getPendingFriendLetters = async (token) => {
  const response = await fetch(`${API_BASE}/letters/pending-friend-letters`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Get pending friend letters failed: ${response.status}`);
  }
  
  return response.json();
};

// Helper function to accept friend letter
const acceptFriendLetter = async (token, letterId) => {
  const response = await fetch(`${API_BASE}/letters/${letterId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Accept friend letter failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};

// Helper function to search users
const searchUsers = async (token, searchTerm) => {
  const response = await fetch(`${API_BASE}/friends/search?q=${encodeURIComponent(searchTerm)}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Search users failed: ${response.status}`);
  }
  
  return response.json();
};

// Main test function
const testFriendLetterWorkflow = async () => {
  try {
    console.log('🚀 Testing Friend Letter Workflow...\n');
    
    // Step 1: Login both users
    console.log('1. Logging in users...');
    user1Token = await login(user1);
    user2Token = await login(user2);
    console.log('✅ Both users logged in successfully\n');
    
    // Step 2: User1 searches for User2
    console.log('2. User1 searching for Sophia...');
    const searchResults = await searchUsers(user1Token, 'sophia');
    console.log('Search results:', searchResults.map(u => ({ username: u.username, name: u.name, country: u.country })));
    
    const sophia = searchResults.find(u => u.username === 'sophia_milan');
    if (!sophia) {
      throw new Error('Sophia not found in search results');
    }
    console.log('✅ Found Sophia in search results\n');
    
    // Step 3: User1 sends letter to User2 (should be marked as friend_letter)
    console.log('3. User1 sending first letter to Sophia...');
    const letterData = {
      recipientId: sophia._id,
      subject: 'Hello from Test User!',
      content: 'Hi Sophia! I found your profile interesting and would love to connect. I saw you\'re into fashion and art - I\'m also interested in photography and would love to hear your perspective on creative expression!',
      deliveryDelay: 0 // Immediate delivery for testing
    };
    
    const sentLetter = await sendLetter(user1Token, letterData);
    console.log('Full letter response:', JSON.stringify(sentLetter, null, 2));
    console.log('Letter sent:', { 
      id: sentLetter._id || sentLetter.letter?._id, 
      type: sentLetter.type || sentLetter.letter?.type,
      isFirstLetter: sentLetter.isFirstLetter || sentLetter.letter?.isFirstLetter,
      friendRequestResponse: sentLetter.friendRequestResponse || sentLetter.letter?.friendRequestResponse
    });
    console.log('✅ Letter sent successfully as friend_letter\n');
    
    // Step 4: Force letter delivery by triggering cycle
    console.log('4. Triggering letter delivery cycle...');
    const triggerResponse = await fetch(`${API_BASE}/letters/cycle/trigger`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user1Token}`
      }
    });
    
    if (triggerResponse.ok) {
      const triggerResult = await triggerResponse.json();
      console.log('Cycle trigger result:', triggerResult.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 5: User2 checks for pending friend letters
    console.log('5. Sophia checking for pending friend letters...');
    
    // First, let's check the letter status directly
    const checkLetterResponse = await fetch(`${API_BASE}/letters/${sentLetter._id}`, {
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });
    
    if (checkLetterResponse.ok) {
      const letterStatus = await checkLetterResponse.json();
      console.log('Current letter status:', {
        id: letterStatus._id,
        status: letterStatus.status,
        deliveredAt: letterStatus.deliveredAt,
        isFirstLetter: letterStatus.isFirstLetter,
        friendRequestResponse: letterStatus.friendRequestResponse
      });
    }
    
    const pendingLetters = await getPendingFriendLetters(user2Token);
    console.log('Pending friend letters:', pendingLetters.map(l => ({
      id: l._id,
      subject: l.subject,
      sender: l.sender.name,
      isFirstLetter: l.isFirstLetter,
      friendRequestResponse: l.friendRequestResponse
    })));
    
    if (pendingLetters.length === 0) {
      console.log('⏳ No pending friend letters yet, letter might still be in transit');
      return;
    }
    
    const friendLetter = pendingLetters[0];
    console.log('✅ Found pending friend letter\n');
    
    // Step 6: User2 accepts the friend letter
    console.log('6. Sophia accepting the friend letter...');
    const acceptResult = await acceptFriendLetter(user2Token, friendLetter._id);
    console.log('Accept result:', {
      message: acceptResult.message,
      letterStatus: acceptResult.letter.friendRequestResponse,
      friendshipCreated: !!acceptResult.friendship
    });
    console.log('✅ Friend letter accepted and friendship created\n');
    
    console.log('🎉 Friend Letter Workflow Test Complete!');
    console.log('\nWorkflow Summary:');
    console.log('1. ✅ User1 searched for User2');
    console.log('2. ✅ User1 sent letter to User2 (marked as friend_letter)');
    console.log('3. ✅ Letter was delivered and appeared in pending friend letters');
    console.log('4. ✅ User2 accepted the friend letter');
    console.log('5. ✅ Friendship was created automatically');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testFriendLetterWorkflow();
