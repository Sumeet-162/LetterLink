import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Letter from './src/models/Letter.js';

dotenv.config();

async function checkLetters() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/letterlink');
    console.log('Connected to MongoDB');

    // Find your user
    const yourUser = await User.findOne().sort({ _id: -1 });
    if (!yourUser) {
      console.error('No user found');
      process.exit(1);
    }
    console.log(`\nChecking letters for: ${yourUser.name} (@${yourUser.username})`);
    console.log(`User ID: ${yourUser._id}`);

    // Find all letters for this user
    const letters = await Letter.find({ recipient: yourUser._id })
      .populate('sender', 'username name country interests')
      .sort({ deliveredAt: -1 });

    console.log(`\n📧 Found ${letters.length} letters in database:`);
    
    letters.forEach((letter, index) => {
      console.log(`\n${index + 1}. "${letter.subject}"`);
      console.log(`   From: ${letter.sender?.name} (@${letter.sender?.username}) - ${letter.sender?.country}`);
      console.log(`   Status: ${letter.status}`);
      console.log(`   Type: ${letter.type}`);
      console.log(`   Delivered: ${letter.deliveredAt}`);
      console.log(`   Interests: ${letter.sender?.interests?.join(', ')}`);
    });

    // Check letter statuses
    const statusCounts = {
      delivered: letters.filter(l => l.status === 'delivered').length,
      read: letters.filter(l => l.status === 'read').length,
      sent: letters.filter(l => l.status === 'sent').length
    };

    console.log(`\n📊 Letter Status Summary:`);
    console.log(`   Delivered: ${statusCounts.delivered}`);
    console.log(`   Read: ${statusCounts.read}`);
    console.log(`   Sent: ${statusCounts.sent}`);

    // Check if there are any filtering issues
    const deliveredOrRead = letters.filter(l => l.status === 'delivered' || l.status === 'read');
    console.log(`\n✅ Letters that should appear in inbox: ${deliveredOrRead.length}`);

  } catch (error) {
    console.error('Error checking letters:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkLetters();
