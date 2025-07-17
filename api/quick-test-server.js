import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:8081',
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'LetterLink API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test friends route with mock data
app.get('/api/friends', (req, res) => {
  // Mock friends data for testing
  const mockFriends = [
    {
      _id: '1',
      username: 'akira_tokyo',
      name: 'Akira',
      country: 'Japan',
      timezone: 'Asia/Tokyo',
      letterCount: 8,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      lastActivityType: 'received',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '2',
      username: 'elena_prague',
      name: 'Elena',
      country: 'Czech Republic',
      timezone: 'Europe/Prague',
      letterCount: 12,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      lastActivityType: 'sent',
      lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '3',
      username: 'marcus_sydney',
      name: 'Marcus',
      country: 'Australia',
      timezone: 'Australia/Sydney',
      letterCount: 3,
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      lastActivityType: 'delivered',
      lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  res.json(mockFriends);
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}`);
  console.log(`🔗 Test friends endpoint: http://localhost:${PORT}/api/friends`);
});
