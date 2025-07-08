// /routes/admin/graphStats.js
import express from 'express';
import RateLimit from 'express-rate-limit';
import auth from '../../middleware/auth.js';
import User from '../../models/User.js';

const router = express.Router();

// Define rate limiter: max 100 requests per 15 minutes
const graphStatsLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests to /graph-stats. Please try again later."
});

router.get('/graph-stats', graphStatsLimiter, auth('admin'), async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

    const stats = await User.aggregate([
      { $match: { createdAt: { $gte: lastMonth } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }},
        registrations: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({ stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
