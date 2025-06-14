// routes/userProfile.js
// Created: 6/13/2025 by Mohammad Hoque
// Description: Express route to fetch and update user profiles (no authMiddleware yet)

import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /profile?walletAddress=xyz
router.get('/profile', async (req, res) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid walletAddress' });
    }

    const user = await User.findOne({ walletAddress });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /profile
router.post('/profile', async (req, res) => {
  try {
    const { walletAddress, ...data } = req.body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid walletAddress in request body' });
    }

    const result = await User.updateOne(
      { walletAddress },
      { $set: { ...data } },
      { upsert: true }
    );

    res.status(200).json({ message: 'Profile updated', result });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
