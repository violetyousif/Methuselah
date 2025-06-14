// routes/userProfile.js
// Created: 6/13/2025 by Mohammad Hoque
// Description: Secure Express route to fetch and update user profiles

import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET /profile — Securely fetch user profile using JWT
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('GET /profile — Decoded user:', req.user);

    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /profile — Securely update partial user profile data using JWT
router.patch('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;

    console.log('PATCH /profile — Decoded user:', req.user);
    console.log('PATCH /profile — Incoming data:', updates);

    const result = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!result) {
      return res.status(404).json({ message: 'User not found or not updated' });
    }

    res.status(200).json({ message: 'Profile updated', result });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
