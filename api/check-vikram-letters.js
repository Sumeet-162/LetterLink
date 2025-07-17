import mongoose from 'mongoose';
import User from './src/models/User.js';
import Letter from './src/models/Letter.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/letterlink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkVikramLetters() {
  try {
    console.log('🔍 Checking vikram letters...');
    
    // Find vikram user
    const vikramUser = await User.findOne({ username: 'vikram' });
    if (!vikramUser) {
      console.log('❌ Vikram user not found');
      return;
    }
    
    console.log('✅ Found vikram user:', vikramUser._id);
    
    // Find letters for vikram
    const letters = await Letter.find({ recipient: vikramUser._id })
      .populate('sender', 'username name country')
      .sort({ deliveredAt: -1 });
    
    console.log(`📧 Found ${letters.length} letters for vikram:`);
    letters.forEach((letter, index) => {
      console.log(`   ${index + 1}. "${letter.subject}" from ${letter.sender?.name} (${letter.sender?.country})`);
      console.log(`      Status: ${letter.status}, Type: ${letter.type}, Premium: ${letter.isPremium}, Locked: ${letter.isLocked}`);
    });
    
    if (letters.length === 0) {
      console.log('⚠️ No letters found for vikram. Need to create them.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkVikramLetters();
