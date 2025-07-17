import mongoose from 'mongoose';
import User from './src/models/User.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/letterlink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkVikramUser() {
  try {
    console.log('🔍 Searching for vikram user...');
    
    // Check by username
    const userByUsername = await User.findOne({ username: 'vikram' });
    console.log('By username:', userByUsername ? 'Found' : 'Not found');
    
    // Check by email
    const userByEmail = await User.findOne({ email: 'vikramfake@gmail.com' });
    console.log('By email:', userByEmail ? 'Found' : 'Not found');
    
    // List all users to see what's in the database
    const allUsers = await User.find({}, 'username email name').limit(10);
    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.name || 'No name'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkVikramUser();
