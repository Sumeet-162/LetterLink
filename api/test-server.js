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

// Simple test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'LetterLink API is running!',
    timestamp: new Date().toISOString()
  });
});

console.log(`Starting server on port ${PORT}`);
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}`);
});
