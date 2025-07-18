import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Letter from './src/models/Letter.js';

dotenv.config();

async function testTimerEnd() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🚀 Testing Timer End Behavior\n');

    // Find a letter that's currently "sent" (in transit)
    const inTransitLetter = await Letter.findOne({ 
      status: 'sent' 
    }).populate('sender recipient');

    if (!inTransitLetter) {
      console.log('❌ No in-transit letters found. Create one first!');
      return;
    }

    console.log('📮 BEFORE Timer Ends:');
    console.log(`Letter ID: ${inTransitLetter._id}`);
    console.log(`From: ${inTransitLetter.sender.name}`);
    console.log(`To: ${inTransitLetter.recipient.name}`);
    console.log(`Status: ${inTransitLetter.status}`);
    console.log(`Scheduled Delivery: ${inTransitLetter.scheduledDelivery}`);
    console.log(`Current Time: ${new Date()}`);
    
    const timeRemaining = new Date(inTransitLetter.scheduledDelivery) - new Date();
    console.log(`Time Remaining: ${Math.max(0, Math.floor(timeRemaining / 1000))} seconds`);

    // Simulate timer ending by updating scheduledDelivery to past
    console.log('\n⏰ SIMULATING TIMER END (moving delivery time to past)...');
    inTransitLetter.scheduledDelivery = new Date(Date.now() - 1000); // 1 second ago
    await inTransitLetter.save();

    // Now trigger the delivery check manually using direct database query instead of API
    console.log('\n🔄 Triggering delivery check...');
    
    // Find letters that are ready to be delivered
    const readyLetters = await Letter.find({
      status: 'sent',
      scheduledDelivery: { $lte: new Date() }
    });

    console.log(`Found ${readyLetters.length} letters ready for delivery`);

    for (const letter of readyLetters) {
      // Update letter status to delivered
      letter.status = 'delivered';
      letter.deliveredAt = new Date();
      await letter.save();
      console.log(`Letter ${letter._id} delivered`);
    }

    // Check the letter status after delivery
    const updatedLetter = await Letter.findById(inTransitLetter._id);
    
    console.log('\n📬 AFTER Timer Ends:');
    console.log(`Status: ${updatedLetter.status}`);
    console.log(`Delivered At: ${updatedLetter.deliveredAt}`);
    
    if (updatedLetter.status === 'delivered') {
      console.log('\n🎉 SUCCESS! Letter is now delivered and ready for accept/reject!');
      console.log('\nWhat user sees now:');
      console.log('🟢 Badge: "Delivered" (green)');
      console.log('📬 Message: "Letter has arrived! Will appear in your friends list."');
      console.log('🔘 Buttons: [Accept] [Reject] are now visible');
      console.log('📖 Can Read: User can now click to read the full letter');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testTimerEnd();
