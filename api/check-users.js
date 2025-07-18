import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/letterlink');
    console.log('Connected to MongoDB');

    const users = await User.find({
      email: { $in: ['alice@test.com', 'bob@test.com'] }
    }).select('email username name');

    console.log('Found users:', users);

    // Try to verify password for Alice
    const alice = await User.findOne({ email: 'alice@test.com' }).select('+password');
    if (alice) {
      console.log('Alice found with password field:', !!alice.password);
      
      // Test password comparison
      const isValidPassword = await alice.comparePassword('password123');
      console.log('Password test for Alice:', isValidPassword);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
