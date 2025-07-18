import { MongoClient, ObjectId } from 'mongodb';

async function checkDatabase() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('letterlink');
    
    console.log('\n=== CHECKING LETTERS FOR REPLY TESTING ===\n');
    
    // Find Alice and Bob
    const alice = await db.collection('users').findOne({ username: 'alice_newyork' });
    const bob = await db.collection('users').findOne({ username: 'bob_london' });
    
    if (!alice || !bob) {
      console.log('Alice or Bob not found!');
      console.log('Alice:', alice ? 'Found' : 'Not found');
      console.log('Bob:', bob ? 'Found' : 'Not found');
      return;
    }
    
    console.log('Alice ID:', alice._id.toString());
    console.log('Bob ID:', bob._id.toString());
    
    // Check friendship
    const friendship = await db.collection('friends').findOne({
      $or: [
        { user1: alice._id, user2: bob._id },
        { user1: bob._id, user2: alice._id }
      ]
    });
    
    console.log('\nFriendship status:', friendship ? 'Friends' : 'Not friends');
    
    // Find letters that can be replied to (status='read' and Bob is recipient)
    const lettersToReply = await db.collection('letters').find({
      recipient: bob._id,
      status: 'read',
      archived: { $ne: true }
    }).sort({ createdAt: -1 }).toArray();
    
    console.log('\nLetters Bob can reply to:', lettersToReply.length);
    
    for (let letter of lettersToReply) {
      console.log('\n--- Letter Details ---');
      console.log('ID:', letter._id.toString());
      console.log('From:', letter.sender.toString());
      console.log('To:', letter.recipient.toString());
      console.log('Subject:', letter.subject);
      console.log('Status:', letter.status);
      console.log('Archived:', letter.archived || false);
      console.log('Created:', letter.createdAt);
      
      // Test canReply logic manually
      const isRecipient = letter.recipient.toString() === bob._id.toString();
      const isRead = letter.status === 'read';
      const notArchived = !letter.archived;
      
      console.log('Can reply check:');
      console.log('  - Is recipient?', isRecipient);
      console.log('  - Is read?', isRead);
      console.log('  - Not archived?', notArchived);
      console.log('  - Overall can reply?', isRecipient && isRead && notArchived);
    }
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();
