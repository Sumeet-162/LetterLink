import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const testPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/letterlink');
    console.log('Connected to MongoDB');

    // Delete existing alice user
    await User.deleteOne({ email: 'alice@test.com' });

    // Create user using the User model's built-in password hashing
    const alice = new User({
      username: 'alice_newyork',
      email: 'alice@test.com',
      password: 'password123', // Let the model hash it
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

    await alice.save();
    console.log('Alice created with model-based hashing');

    // Test password comparison
    const testUser = await User.findOne({ email: 'alice@test.com' }).select('+password');
    const isValid = await testUser.comparePassword('password123');
    console.log('Password test result:', isValid);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testPassword();
