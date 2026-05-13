import express from 'express';
import auth from '../middleware/auth.js';
import { chatWithOpenAI } from '../services/openaiService.js';

const router = express.Router();

async function handleChat(req, res) {
  const { message } = req.body;

  try {
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await chatWithOpenAI(message);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'AI service error' });
  }
}

router.post('/', handleChat);
router.post('/private', auth, handleChat);

export default router;
