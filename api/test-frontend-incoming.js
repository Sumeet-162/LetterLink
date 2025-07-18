import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test users
const userA = { email: 'test@letterlink.com', password: 'password123' }; // testuser
const userB = { email: 'yuki@letterlink.com', password: 'password123' }; // yuki

async function testIncomingLetters() {
  try {
    console.log('🚀 Testing Incoming Letters Display');

    // Login both users
    const loginA = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userA)
    });
    const tokenA = (await loginA.json()).token;

    const loginB = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userB)
    });
    const tokenB = (await loginB.json()).token;

    console.log('✅ Both users logged in');

    // Send letter from A to B
    const letterData = {
      recipientId: '687a26d8f62941b76031c1fb', // Yuki's ID
      subject: 'Test Letter for Frontend',
      content: 'This letter should appear in incoming letters section with a timer!',
      deliveryDelay: 0.05 // 3 minutes for testing
    };

    const sendResponse = await fetch(`${API_BASE}/letters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify(letterData)
    });

    const letter = await sendResponse.json();
    console.log('✅ Letter sent:', {
      id: letter._id,
      status: letter.status,
      scheduledDelivery: letter.scheduledDelivery,
      deliveryDelay: letter.deliveryDelay
    });

    // Check incoming letters for User B
    const incomingResponse = await fetch(`${API_BASE}/letters/incoming`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });

    const incomingLetters = await incomingResponse.json();
    console.log('📬 Incoming letters for User B:', incomingLetters.length);
    
    if (incomingLetters.length > 0) {
      const letter = incomingLetters[0];
      console.log('Letter details:', {
        subject: letter.subject,
        sender: letter.sender.name,
        timeRemaining: Math.ceil(letter.timeRemaining / 1000) + ' seconds',
        canRead: letter.canRead
      });
    }

    console.log('\n🎉 Test completed! Check the frontend Friends page now.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testIncomingLetters();
