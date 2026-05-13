import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import alertRoutes from './routes/alerts.js';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../frontend');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(frontendPath));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mindmate' });
});

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/chat', chatRoutes);

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

async function startServer() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
    }
  } else {
    console.warn('MONGODB_URI is not set. Auth routes will be unavailable until MongoDB is configured.');
  }

  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
