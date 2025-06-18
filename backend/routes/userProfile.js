// Violet Yousif, 6/16/2025, Created profile endpoint for saving user profile data

import express from 'express';
import getUser from '../models/User.js';
import auth from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Define rate limiter: maximum of 20 requests per 15 minutes
const profileRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
});
// GET route to fetch current user profile - Mohammad
router.get('/profile', auth, profileRateLimiter, async (req, res) => {
  try {
    const user = await getUser.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Build the userProfile object
    const userProfile = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      activityLevel: user.activityLevel,
      sleepHours: user.sleepHours,
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
});
router.patch('/profile', auth, profileRateLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, age, weight, height, activityLevel, sleepHours } = req.body;
    
    const user = await getUser.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user profile data
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (age !== undefined) user.age = age;
    if (weight !== undefined) user.weight = weight;
    if (height !== undefined) user.height = height;
    if (activityLevel !== undefined) user.activityLevel = activityLevel;
    if (sleepHours !== undefined) user.sleepHours = sleepHours;

    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

