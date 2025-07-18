import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import FriendRequest from './src/models/FriendRequest.js';
import Letter from './src/models/Letter.js';
import InTransitLetter from './src/models/InTransitLetter.js';
import { calculateTestDeliveryTime } from './src/utils/deliveryTime.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const createTestFriendRequests = async () => {
  try {
    // Get all users
    const users = await User.find({ profileCompleted: true });
    console.log('Found users:', users.length);

    if (users.length < 3) {
      console.log('Not enough users found. Please run create-test-data.js first.');
      return;
    }

    // Clear existing friend requests and in-transit letters
    await FriendRequest.deleteMany({});
    await InTransitLetter.deleteMany({});
    console.log('Cleared existing friend requests and in-transit letters');

    // Find test user and other users
    const testUser = users.find(u => u.username === 'testuser');
    const akira = users.find(u => u.username === 'akira_tokyo');
    const elena = users.find(u => u.username === 'elena_prague');
    const marcus = users.find(u => u.username === 'marcus_sydney');

    if (!testUser || !akira || !elena || !marcus) {
      console.log('Required users not found');
      return;
    }

    console.log('Creating friend requests...');

    // Create friend requests to test user (these will be incoming)
    const incomingRequests = [
      {
        sender: akira._id,
        recipient: testUser._id,
        subject: 'Hello from Tokyo!',
        content: 'Hi! I noticed we both love photography. I\'m Akira from Tokyo and I\'d love to share some stories about Japanese culture and photography techniques I\'ve learned. Would you like to be friends and exchange letters?'
      },
      {
        sender: elena._id,
        recipient: testUser._id,
        subject: 'Greetings from Prague',
        content: 'Hello! I saw your profile and noticed you\'re interested in travel and writing. I\'m an architect from Prague who loves literature. I think we\'d have great conversations about exploring new places and stories. Hope to hear from you!'
      }
    ];

    // Create friend requests from test user (these will be outgoing)
    const outgoingRequests = [
      {
        sender: testUser._id,
        recipient: marcus._id,
        subject: 'Adventure stories from a fellow traveler',
        content: 'Hey Marcus! I saw you\'re into outdoor adventures and surfing. I\'m really interested in travel and photography, and I\'d love to hear about your Australian wilderness experiences. Want to be friends and share some adventure stories?'
      }
    ];

    // Process incoming requests (create with delivery timing)
    for (const reqData of incomingRequests) {
      // Create the letter first
      const letter = await Letter.create({
        sender: reqData.sender,
        recipient: reqData.recipient,
        subject: reqData.subject,
        content: reqData.content,
        letterType: 'friend_request',
        status: 'delivered'
      });

      // Get sender and recipient info for delivery calculation
      const sender = users.find(u => u._id.toString() === reqData.sender.toString());
      const recipient = users.find(u => u._id.toString() === reqData.recipient.toString());

      // Calculate delivery time
      const deliveryInfo = calculateTestDeliveryTime(sender.country, recipient.country);

      // Create friend request
      const friendRequest = await FriendRequest.create({
        sender: reqData.sender,
        recipient: reqData.recipient,
        letter: letter._id,
        status: 'pending',
        isDelivered: false // Will be delivered after transit time
      });

      // Create in-transit letter entry
      await InTransitLetter.create({
        sender: reqData.sender,
        recipient: reqData.recipient,
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

      console.log(`Created friend request from ${sender.username} to ${recipient.username} - Delivery in ${deliveryInfo.estimatedDeliveryText}`);
    }

    // Process outgoing requests (also create with delivery timing)
    for (const reqData of outgoingRequests) {
      // Create the letter first
      const letter = await Letter.create({
        sender: reqData.sender,
        recipient: reqData.recipient,
        subject: reqData.subject,
        content: reqData.content,
        letterType: 'friend_request',
        status: 'delivered'
      });

      // Get sender and recipient info for delivery calculation
      const sender = users.find(u => u._id.toString() === reqData.sender.toString());
      const recipient = users.find(u => u._id.toString() === reqData.recipient.toString());

      // Calculate delivery time
      const deliveryInfo = calculateTestDeliveryTime(sender.country, recipient.country);

      // Create friend request
      const friendRequest = await FriendRequest.create({
        sender: reqData.sender,
        recipient: reqData.recipient,
        letter: letter._id,
        status: 'pending',
        isDelivered: false
      });

      // Create in-transit letter entry
      await InTransitLetter.create({
        sender: reqData.sender,
        recipient: reqData.recipient,
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

      console.log(`Created friend request from ${sender.username} to ${recipient.username} - Delivery in ${deliveryInfo.estimatedDeliveryText}`);
    }

    // Create one delivered friend request for immediate testing
    const deliveredLetter = await Letter.create({
      sender: marcus._id,
      recipient: testUser._id,
      subject: 'Quick hello from Australia',
      content: 'G\'day! Just a quick note to say hello and see if you\'d like to be friends. I love your photography interests!',
      letterType: 'friend_request',
      status: 'delivered'
    });

    const deliveredRequest = await FriendRequest.create({
      sender: marcus._id,
      recipient: testUser._id,
      letter: deliveredLetter._id,
      status: 'pending',
      isDelivered: true, // This one is already delivered
      deliveredAt: new Date()
    });

    console.log('Created one immediately delivered friend request for testing');

    console.log('✅ Test friend requests created successfully!');
    console.log('- 2 incoming requests in transit');
    console.log('- 1 outgoing request in transit');
    console.log('- 1 delivered request ready for acceptance');
    console.log('');
    console.log('You can now:');
    console.log('1. Login as testuser (test@letterlink.com / password123)');
    console.log('2. Check the Friends page for incoming letters and friend requests');
    console.log('3. Test the accept/reject functionality');

  } catch (error) {
    console.error('Error creating test friend requests:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the script
connectDB().then(createTestFriendRequests);
