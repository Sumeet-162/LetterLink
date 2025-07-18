import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Letter from './src/models/Letter.js';

dotenv.config();

const debugConversation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/letterlink');
    console.log('Connected to MongoDB');

    // Get Alice and Bob
    const alice = await User.findOne({ email: 'alice@test.com' });
    const bob = await User.findOne({ email: 'bob@test.com' });
    
    console.log('Users:');
    console.log('Alice:', { id: alice._id, name: alice.name, username: alice.username });
    console.log('Bob:', { id: bob._id, name: bob.name, username: bob.username });
    
    // Get all letters between them
    const letters = await Letter.find({
      $or: [
        { sender: alice._id, recipient: bob._id },
        { sender: bob._id, recipient: alice._id }
      ]
    })
    .populate('sender', 'username name')
    .populate('recipient', 'username name')
    .sort({ createdAt: 1 });
    
    console.log('\nLetters in database:');
    letters.forEach((letter, index) => {
      console.log(`Letter ${index + 1}:`, {
        id: letter._id,
        subject: letter.subject,
        sender: letter.sender,
        recipient: letter.recipient,
        status: letter.status,
        type: letter.type,
        createdAt: letter.createdAt
      });
    });

    // Test what Alice's conversation endpoint would return
    console.log('\nTesting conversation endpoint for Alice...');
    const aliceConversation = await Letter.find({
      $or: [
        { sender: alice._id, recipient: bob._id },
        { sender: bob._id, recipient: alice._id }
      ],
      status: { $in: ['delivered', 'read'] }
    })
    .populate('sender', 'username name profilePicture')
    .populate('recipient', 'username name profilePicture')
    .populate('replyTo', 'subject createdAt')
    .sort({ createdAt: 1 });

    console.log('Alice\'s conversation view:');
    aliceConversation.forEach((letter, index) => {
      console.log(`Conversation Letter ${index + 1}:`, {
        id: letter._id,
        subject: letter.subject,
        sender: letter.sender,
        recipient: letter.recipient,
        isAliceSender: letter.sender._id.toString() === alice._id.toString(),
        status: letter.status
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugConversation();
