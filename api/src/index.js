import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8081', // Development frontend
  credentials: true
}));
app.use(express.json());

// Root route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'LetterLink API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/letterlink';

console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@'));
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    console.log('Database name:', mongoose.connection.db.databaseName);
    console.log('Available collections:', mongoose.connection.db.listCollections());
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
  });

export default app;
