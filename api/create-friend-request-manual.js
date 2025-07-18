import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FriendRequest from './src/models/FriendRequest.js';
import Letter from './src/models/Letter.js';
import User from './src/models/User.js';

dotenv.config();

async function createFriendRequest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log('Available users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.username}) - ${user.email}`);
    });

    // You can modify these to match your actual usernames
    const senderUsername = 'testacc1'; // The sender account (fghjk)
    const recipientUsername = 'testacc2'; // The recipient account (vbnm,)

    const sender = await User.findOne({ username: senderUsername });
    const recipient = await User.findOne({ username: recipientUsername });

    if (!sender) {
      console.log(`Sender '${senderUsername}' not found. Available users listed above.`);
      process.exit(1);
    }

    if (!recipient) {
      console.log(`Recipient '${recipientUsername}' not found. Available users listed above.`);
      process.exit(1);
    }

    // First create the letter
    const letter = await Letter.create({
      sender: sender._id,
      recipient: recipient._id,
      subject: 'Friend Request - Let\'s Connect!',
      content: 'Hi there! I would love to become friends and exchange letters with you. I think we could have some wonderful conversations!',
      status: 'sent',
      type: 'letter'
    });

    // Then create the friend request
    const friendRequest = await FriendRequest.create({
      sender: sender._id,
      recipient: recipient._id,
      letter: letter._id,
      status: 'pending',
      isDelivered: true, // Set to true so it appears immediately
      deliveredAt: new Date() // Set delivery time to now
    });

    console.log(`✅ Friend request created!`);
    console.log(`From: ${sender.name} (${sender.username})`);
    console.log(`To: ${recipient.name} (${recipient.username})`);
    console.log(`Status: ${friendRequest.status}`);
    console.log(`Letter ID: ${letter._id}`);
    console.log(`\nNow login as ${recipient.username} and check the Friends page.`);
    console.log(`You should see the friend request with Accept/Reject buttons.`);

  } catch (error) {
    console.error('Error creating friend request:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createFriendRequest();
