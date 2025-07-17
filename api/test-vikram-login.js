import mongoose from 'mongoose';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/letterlink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testVikramLogin() {
  try {
    console.log('🔍 Testing vikram login credentials...');
    
    // Find vikram user
    const vikramUser = await User.findOne({ username: 'vikram' }).select('+password');
    if (!vikramUser) {
      console.log('❌ Vikram user not found');
      return;
    }
    
    console.log('✅ Found vikram user:', vikramUser.username, vikramUser.email);
    console.log('🔑 Stored password hash:', vikramUser.password);
    
    // Test password
    const testPassword = 'testpassword123';
    const isPasswordValid = await bcrypt.compare(testPassword, vikramUser.password);
    
    console.log(`🔐 Password "${testPassword}" is ${isPasswordValid ? 'VALID ✅' : 'INVALID ❌'}`);
    
    if (isPasswordValid) {
      console.log('\n🎯 LOGIN CREDENTIALS:');
      console.log('   Username: vikram');
      console.log('   Password: testpassword123');
      console.log('\n👆 Use these exact credentials to log in!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testVikramLogin();
