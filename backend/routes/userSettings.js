// Name: Mizanur Mizan
// Description: Created the backend route for settings page
// Date: 6/11/25

// routes/userSettings.js

import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/update-settings', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    const {
      name,
      birthday,
      profilePic,
      theme,
      fontSize
    } = req.body;

    // Parse name into firstName and lastName
    const [firstName = '', lastName = ''] = name.split(' ');

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        dateOfBirth: birthday,
        profilePic,
        preferences: {
          theme,
          fontSize
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({ message: 'Settings updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

export default router;
