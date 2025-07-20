// /routes/admin/userStats.js
// Mohammad Hoque, 07/18/2025, Admin route to get user statistics
import express from 'express';
import RateLimit from 'express-rate-limit';
import auth from '../../middleware/auth.js';
import User from '../../models/User.js';

const router = express.Router();

// Define rate limiter: max 100 requests per 15 minutes
const userStatsLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests to /user-stats. Please try again later."
});

router.get('/users', userStatsLimiter, auth('admin'), async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    
    res.status(200).json({ 
      success: true,
      count: userCount,
      message: `Total users: ${userCount}`
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;
