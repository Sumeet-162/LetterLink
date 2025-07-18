const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models (adjust paths as needed)
const User = require('./src/models/User');
const FriendRequest = require('./controllers/FriendRequest');
const Letter = require('./controllers/Letter');
const InTransitLetter = require('./models/InTransitLetter');

// Import delivery time utilities
const { getDeliveryTime, getRemainingTime } = require('./src/utils/deliveryTime');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/letterLink')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create test users if they don't exist
    const users = [
      { name: 'Test User', email: 'test@letterlink.com', password: 'password123', country: 'United States' },
      { name: 'John Doe', email: 'john@example.com', password: 'password123', country: 'Japan' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', country: 'United Kingdom' },
      { name: 'Bob Wilson', email: 'bob@example.com', password: 'password123', country: 'Germany' },
      { name: 'Alice Brown', email: 'alice@example.com', password: 'password123', country: 'Canada' }
    ];

    console.log('\n🔧 Creating test users...');
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        await user.save();
        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
      } else {
        console.log(`ℹ️  User already exists: ${userData.name} (${userData.email})`);
      }
    }

    // Get user references
    const testUser = await User.findOne({ email: 'test@letterlink.com' });
    const johnUser = await User.findOne({ email: 'john@example.com' });
    const janeUser = await User.findOne({ email: 'jane@example.com' });
    const bobUser = await User.findOne({ email: 'bob@example.com' });
    const aliceUser = await User.findOne({ email: 'alice@example.com' });

    console.log('\n📨 Creating friend requests...');

    // Helper function to create friend request with letter
    async function createFriendRequestWithLetter(fromUser, toUser, subject, content) {
      // Create the letter first
      const letter = new Letter({
        from: fromUser._id,
        to: toUser._id,
        subject: subject,
        content: content,
        status: 'sent'
      });
      await letter.save();

      // Calculate delivery time
      const deliveryMinutes = getDeliveryTime(fromUser.country, toUser.country);
      const deliveryDate = new Date(Date.now() + deliveryMinutes * 60 * 1000);

      // Create friend request
      const friendRequest = new FriendRequest({
        from: fromUser._id,
        to: toUser._id,
        letter: letter._id,
        deliveryDate: deliveryDate,
        status: 'pending'
      });
      await friendRequest.save();

      // Create in-transit letter if delivery is not immediate
      if (deliveryMinutes > 0) {
        const inTransitLetter = new InTransitLetter({
          letter: letter._id,
          friendRequest: friendRequest._id,
          from: fromUser._id,
          to: toUser._id,
          deliveryDate: deliveryDate,
          estimatedDeliveryTime: deliveryMinutes
        });
        await inTransitLetter.save();
        console.log(`📮 Created in-transit friend request: ${fromUser.name} → ${testUser.name} (${getRemainingTime(deliveryDate)})`);
      } else {
        console.log(`📬 Created immediate friend request: ${fromUser.name} → ${testUser.name}`);
      }

      return { friendRequest, letter };
    }

    // 1. Incoming friend request from John (Japan → US, ~10 minutes in test mode)
    await createFriendRequestWithLetter(
      johnUser,
      testUser,
      "Greetings from Tokyo!",
      "Hi! I'd love to be pen pals. I'm writing from Tokyo and would love to share stories about life in Japan. Looking forward to hearing from you!"
    );

    // 2. Incoming friend request from Jane (UK → US, ~5 minutes in test mode)
    await createFriendRequestWithLetter(
      janeUser,
      testUser,
      "Hello from London!",
      "Dear friend, I'm reaching out from London. I enjoy writing letters and would love to connect with someone across the pond. Hope to hear back from you soon!"
    );

    // 3. Outgoing friend request to Bob (US → Germany, ~6 minutes in test mode)
    await createFriendRequestWithLetter(
      testUser,
      bobUser,
      "Greetings from America!",
      "Hello Bob! I'd love to start a letter exchange with you. I'm fascinated by German culture and would enjoy learning more through our correspondence."
    );

    // 4. Immediate friend request from Alice (Canada → US, immediate delivery)
    await createFriendRequestWithLetter(
      aliceUser,
      testUser,
      "Hello from your northern neighbor!",
      "Hi there! Writing from Canada, just next door. Since we're so close, this letter should arrive right away. Would love to be pen pals!"
    );

    console.log('\n✅ All friend requests created successfully!');
    console.log('\n📊 Summary:');
    console.log('- 3 incoming friend requests (2 in-transit, 1 delivered)');
    console.log('- 1 outgoing friend request (in-transit)');
    console.log('\n🧪 Test the API with:');
    console.log('- Login as test@letterlink.com / password123');
    console.log('- Check incoming: GET /api/friends/requests');
    console.log('- Accept request: POST /api/friends/requests/:id/accept');
    console.log('- Check in-transit: GET /api/in-transit/letters');

    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
