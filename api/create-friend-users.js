import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import User from './src/models/User.js';
import Friend from './src/models/Friend.js';
import Letter from './src/models/Letter.js';

const createFriendUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/letterlink');
    console.log('Connected to MongoDB');

    // Clear existing users and friendships for clean start
    await User.deleteMany({ username: { $in: ['alice_newyork', 'bob_london'] } });
    await Friend.deleteMany({});
    await Letter.deleteMany({});
    console.log('Cleared existing test data');

    // Create User 1: Alice from New York
    const user1 = await User.create({
      username: 'alice_newyork',
      email: 'alice@test.com',
      password: 'password123', // Let the model hash this automatically
      name: 'Alice Johnson',
      dateOfBirth: new Date('1995-06-15'),
      gender: 'Female',
      relationshipStatus: 'Single',
      languagesKnown: ['English', 'Spanish'],
      writingStyle: 'Casual and friendly',
      country: 'United States',
      timezone: 'America/New_York',
      bio: 'A friendly writer from New York who loves coffee and books.',
      interests: ['Reading', 'Writing', 'Coffee', 'Travel', 'Photography'],
      profileCompleted: true
    });

    // Create User 2: Bob from London
    const user2 = await User.create({
      username: 'bob_london',
      email: 'bob@test.com',
      password: 'password123', // Let the model hash this automatically
      name: 'Bob Smith',
      dateOfBirth: new Date('1992-03-22'),
      gender: 'Male',
      relationshipStatus: 'Single',
      languagesKnown: ['English', 'French'],
      writingStyle: 'Deep and philosophical',
      country: 'United Kingdom',
      timezone: 'Europe/London',
      bio: 'A thoughtful philosopher from London who enjoys tea and deep conversations.',
      interests: ['Philosophy', 'Literature', 'History', 'Tea', 'Art'],
      profileCompleted: true
    });

    console.log('Created users:', {
      user1: { id: user1._id, username: user1.username, name: user1.name },
      user2: { id: user2._id, username: user2.username, name: user2.name }
    });

    // Create friendship between Alice and Bob
    const friendship = await Friend.create({
      user1: user1._id,
      user2: user2._id,
      initiatedBy: user1._id, // Alice initiated the friendship
      status: 'accepted',
      letterCount: 3, // They will have 3 letters between them
      lastActivity: new Date(),
      lastActivityType: 'sent'
    });

    console.log('Created friendship:', friendship);

    // Create a normal delivery letter from Alice to Bob (already friends)
    const letter1 = await Letter.create({
      sender: user1._id,
      recipient: user2._id,
      subject: 'Hello from New York!',
      content: `Dear Bob,

I hope this letter finds you well in London! I've been thinking about our previous conversations and wanted to share some thoughts about life in New York.

The city has been bustling as always, and I've discovered this amazing little coffee shop in Greenwich Village that reminds me of the cafes you described in London. The atmosphere is perfect for writing, and I've been working on some new stories there.

I'd love to hear about what you've been reading lately. Your recommendations always lead me to the most fascinating books! 

Looking forward to your reply.

Warm regards,
Alice`,
      type: 'delivery', // Normal delivery letter between friends
      status: 'read', // Mark as read so Bob can reply
      deliveryDelay: 0.1, // 6 minutes for testing
      deliveredAt: new Date(),
      readAt: new Date(),
      isFirstLetter: false, // NOT a first letter - they're already friends
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    });

    // Create a reply from Bob to Alice (currently in transit for testing)
    const letter2 = await Letter.create({
      sender: user2._id,
      recipient: user1._id,
      subject: 'Re: Hello from New York!',
      content: `Dear Alice,

What a delightful surprise to receive your letter! It brought such warmth to this rather grey London morning.

Your description of the Greenwich Village coffee shop sounds absolutely wonderful. There's something magical about finding the perfect writing spot, isn't there? I have a similar place here - a small bookshop cafe near the British Museum where I often go to read and contemplate.

Speaking of reading, I've recently discovered a fascinating book on existential philosophy by Jean-Paul Sartre that I think you might enjoy. The way he explores the nature of human existence and freedom is quite profound. I'd be happy to send you some excerpts if you're interested.

London has been its usual charming self - misty mornings, the gentle patter of rain on cobblestones, and the comforting ritual of afternoon tea. Sometimes I think this city was made for letter writers like us.

I'm curious about your new stories! What themes are you exploring these days?

With warm regards from across the pond,
Bob`,
      type: 'reply',
      replyTo: letter1._id,
      status: 'sent', // Still in transit
      deliveryDelay: 0.15, // 9 minutes for testing
      scheduledDelivery: new Date(Date.now() + 0.15 * 60 * 60 * 1000), // 9 minutes from now
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    });

    // Create another normal delivery letter from Alice (also in transit)
    const letter3 = await Letter.create({
      sender: user1._id,
      recipient: user2._id,
      subject: 'Re: Re: Hello from New York!',
      content: `Dear Bob,

Thank you for your wonderful reply! I'm so glad my letter brought warmth to your morning. Your description of London has me even more excited about the pen pal tradition we're building.

The British Museum cafe sounds absolutely perfect for contemplation and writing. I would love to visit London someday and experience that atmosphere myself. There's something magical about places that have witnessed so much history and knowledge.

I'm very interested in the Sartre book you mentioned! Existential philosophy has always fascinated me, especially how it relates to the human experience of connection across distances - like what we're doing with these letters. Please do send those excerpts when you get a chance.

As for my stories, I've been exploring themes of connection and serendipity lately. How two people from different corners of the world can find common ground through the simple act of writing letters. It's quite profound when you think about it.

I hope this letter finds you well and that your tea is perfectly steeped!

With warm regards from across the Atlantic,
Alice`,
      type: 'delivery', // Normal delivery letter between friends
      status: 'sent', // Still in transit  
      deliveryDelay: 0.2, // 12 minutes for testing
      scheduledDelivery: new Date(Date.now() + 0.2 * 60 * 60 * 1000), // 12 minutes from now
      isFirstLetter: false, // NOT a first letter - they're already friends
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    });

    // Populate the letters with sender/recipient info
    const populatedLetter1 = await Letter.findById(letter1._id)
      .populate('sender', 'username name profilePicture')
      .populate('recipient', 'username name profilePicture');

    const populatedLetter2 = await Letter.findById(letter2._id)
      .populate('sender', 'username name profilePicture')
      .populate('recipient', 'username name profilePicture')
      .populate('replyTo', 'subject createdAt');

    console.log('Created letters:', {
      letter1: { id: letter1._id, subject: letter1.subject, from: user1.name, to: user2.name, status: letter1.status },
      letter2: { id: letter2._id, subject: letter2.subject, from: user2.name, to: user1.name, status: letter2.status, scheduledDelivery: letter2.scheduledDelivery },
      letter3: { id: letter3._id, subject: letter3.subject, from: user1.name, to: user2.name, status: letter3.status, scheduledDelivery: letter3.scheduledDelivery }
    });

    console.log('\n✅ Successfully created test users and friendship!');
    console.log('\n🔑 Login Credentials:');
    console.log('======================================');
    console.log('User 1 (Alice):');
    console.log('  Email: alice@test.com');
    console.log('  Password: password123');
    console.log('  Username: alice_newyork');
    console.log('  Name: Alice Johnson');
    console.log('');
    console.log('User 2 (Bob):');
    console.log('  Email: bob@test.com');
    console.log('  Password: password123');
    console.log('  Username: bob_london');
    console.log('  Name: Bob Smith');
    console.log('======================================');
    console.log('\n📧 What you can test:');
    console.log('- Login as Alice and see Bob in friends list');
    console.log('- Login as Bob and see Alice in friends list');
    console.log('- View their conversation (3 letters)');
    console.log('- Letter 1: Delivered and read (can reply)');
    console.log('- Letter 2: In transit to Alice (delivery timer visible)');
    console.log('- Letter 3: In transit to Bob (delivery timer visible)');
    console.log('- Reply to delivered letters');
    console.log('- Watch delivery timers count down');
    console.log('- Experience letter delivery delays based on countries');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createFriendUsers();
