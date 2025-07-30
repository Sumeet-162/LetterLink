import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import letterRoutes from './routes/letterRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import draftRoutes from './routes/draftRoutes.js';
import inTransitRoutes from './routes/inTransitRoutes.js';
import { initScheduledTasks } from './services/scheduledTasks.js';
import letterCycleService from './services/letterCycleService.js';
import deliveryService from './services/deliveryService.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:8081',
    'https://letterlink-frontend.vercel.app',  // Original frontend URL
    'https://letterlink-frontend-ivory.vercel.app',  // Your actual frontend URL
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove undefined values
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
app.use('/api/letters', letterRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/in-transit', inTransitRoutes);

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
    
    // Initialize scheduled tasks
    initScheduledTasks();
    
    // Start letter cycle service
    letterCycleService.start();
    
    // Start delivery processor for letter timers
    deliveryService.startDeliveryProcessor();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Letter cycling system active ⏰');
      console.log('Letter delivery processor active 📮');
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
  });

export default app;
