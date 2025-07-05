// Syed Rabbey, 7/1/2025 & 7/2/2025, Created endpoint to retreive user metrics and AI insights for dashboard. Added streak system to pull from MongoDB log.

import express from 'express';
import HealthMetricHistory from '../models/HealthMetricHistory.js';
import getUser from '../models/User.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';


const router = express.Router();


const insightsLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,               // limit each IP to 5 requests per minute
  message: 'Too many requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Utility function: calculate number of days between two dates
const daysBetween = (date1, date2) => {
  const diff = Math.abs(date1 - date2);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

router.get('/healthmetrics/insights', insightsLimiter, auth, async (req, res) => { 
  try {
    const userId = req.user.id;
    const user = await getUser.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Calculate weight change in last 7 days
    const weightHistory = await HealthMetricHistory.find({
      userId,
      metric: 'weight',
      recordedAt: { $gte: sevenDaysAgo }
    }).sort({ recordedAt: 1 });

    let weightTip = '';
    if (weightHistory.length >= 2) {
      const first = weightHistory[0].value;
      const last = weightHistory[weightHistory.length - 1].value;
      const diff = last - first;

      if (diff > 0) weightTip = `💪 You're up ${diff.toFixed(1)} lbs since last week!`;
      else if (diff < 0) weightTip = `👏 You're down ${Math.abs(diff).toFixed(1)} lbs since last week!`;
      else weightTip = `⚖️ Your weight stayed the same this week. Stay consistent!`;
    } else {
      weightTip = `📉 Track your weight more often to see trends!`;
    }

    // 2. Streak Logic
    const streakDocs = await HealthMetricHistory.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          metric: { $in: ['weight', 'sleepHours'] },
        }
      },
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$recordedAt" } }
        }
      },
      {
        $group: { _id: "$day" }
      },
      {
        $sort: { _id: -1 } // descending
      }
    ]);

    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let previousDate = today.toISOString().split('T')[0];

    for (const doc of streakDocs) {
      const currentDay = doc._id;
      if (currentDay === previousDate) {
        streak++;
        const prev = new Date(previousDate);
        prev.setDate(prev.getDate() - 1);
        previousDate = prev.toISOString().split('T')[0];
      } else {
        break;
      }
    }

    // 3. Update longest streak if current is greater
    if (streak > (user.longestStreak || 0)) {
      user.longestStreak = streak;
      await user.save();
    }

    let consistencyTip = '';
    if (streak >= 1) {
      consistencyTip = `✅ Amazing, you've logged data ${streak} day${streak > 1 ? 's' : ''} in a row!`;
    } else {
      consistencyTip = `🗓️ Let's start your streak! Try logging something today.`;
    }

    // 4. Placeholder AI tip
    const aiTip = `🌱 Keep going ${user.firstName || 'friend'}! Every step counts towards your goals.`;

    res.json({
      tip1: weightTip,
      tip2: consistencyTip,
      tip3: aiTip,
      longestStreak: user.longestStreak || 0
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ message: 'Server error while generating dashboard insights' });
  }
});

export default router;
