import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FriendRequest from './src/models/FriendRequest.js';

dotenv.config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await FriendRequest.deleteMany({});
    console.log('Deleted', result.deletedCount, 'friend requests');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanup();
