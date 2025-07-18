import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/letterLink')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear all collections
    const collections = ['friends', 'friendrequests', 'intransitletters', 'letters'];
    
    for (const collectionName of collections) {
      try {
        const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`Cleared ${collectionName}: ${result.deletedCount} documents deleted`);
      } catch (error) {
        console.log(`Error clearing ${collectionName}:`, error.message);
      }
    }
    
    console.log('Database cleared successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });
