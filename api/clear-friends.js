import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/letterLink')
  .then(async () => {
    console.log('Connected to MongoDB');
    const result = await mongoose.connection.db.collection('friends').deleteMany({});
    console.log('Cleared friends:', result.deletedCount);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
