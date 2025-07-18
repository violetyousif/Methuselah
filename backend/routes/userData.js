// Violet Yousif, 6/16/2025, Created user data endpoint for ChatGPT component health data fetching
// Mohammad Hoque, 6/18/2025, Added gender field to user data response
// Mohammad Hoque, 6/19/2025, Replaced age with dateOfBirth in user data response

import express from 'express';
import getUser from '../models/User.js';
import auth from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Define rate limiter: maximum of 50 requests per 15 minutes
const userDataRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
});

// Only left user-data named with dash because of prev students routes
router.get('/user-data', userDataRateLimiter, auth(), async (req, res) => {
  try {
    const user = await getUser.findById(req.user.id).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Return user data in a format compatible with UserData interface
    const userData = {
      // firstName: user.firstName,
      // lastName: user.lastName,
      // email: user.email,
      dateOfBirth: user.dateOfBirth || '', // Changed from age to dateOfBirth
      // weight: user.weight || 0,
      height: user.height || 0,
      gender: user.gender || '', // Added gender field
      activityLevel: user.activityLevel || 'moderate',
      // sleepHours: user.sleepHours || 8,
      profilePic: user.profilePic,
      healthGoal: user.healthGoal || '',
      supplements: user.supplements || '',
      medicine: user.medicine || ''
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('User data fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
