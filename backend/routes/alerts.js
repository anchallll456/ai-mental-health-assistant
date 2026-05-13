import express from 'express';
import { analyzeMentalHealth, buildAlertEmail, sendAlertEmail } from '../services/alertService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message, mood } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and latest message are required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  try {
    const analysis = analyzeMentalHealth({ message, mood });
    const emailPreview = buildAlertEmail({ name, email, message, mood, analysis });
    const delivery = await sendAlertEmail(emailPreview);

    res.json({
      analysis,
      delivery,
      email: emailPreview,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to prepare alert email' });
  }
});

export default router;
