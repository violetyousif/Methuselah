// backend/routes/healthMetrics.js
import express from 'express';
import auth from '../middleware/auth.js';
import HealthMetric from '../models/HealthMetric.js';
import RateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter: maximum of 100 requests per 15 minutes
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' }
});

// Apply rate limiter to all /health-metrics routes
router.use('/health-metrics', limiter);

// GET route to fetch all health metrics for the logged-in user
router.get('/health-metrics', auth(), async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await HealthMetric.findOne({ userId });

    if (!data) return res.status(200).json({ dates: {} }); // No data yet

    res.status(200).json({ dates: data.dates });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ message: 'Server error fetching metrics' });
  }
});

// Save or update daily metrics
router.patch('/health-metrics', auth(), async (req, res) => {
  try {
    const { date, sleepHours, exerciseHours, mood, calories, meals } = req.body;
    const userId = req.user.id;

    // const parsedDate = new Date(date);
    // parsedDate.setHours(0, 0, 0, 0); // Normalize to midnight
    if (!date || sleepHours == null || exerciseHours == null || calories == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const update = {
      [`dates.${date}`]: { sleepHours, exerciseHours, mood, calories, meals }
    };

    const metric = await HealthMetric.findOneAndUpdate(
      { userId },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Health metric saved', metric });
  } catch (error) {
    console.error('Error saving metric:', error);
    res.status(500).json({ message: 'Server error saving metric' });
  }
});

export default router;
