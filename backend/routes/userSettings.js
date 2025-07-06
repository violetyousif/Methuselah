// Mizanur Mizan, 6/11/25, Description: Created the backend route for settings page
// Violet Yousif, 6/14/25, Added fixes to token call in a cookie with JWT_SECRET, fixed import/export syntax
// Violet Yousif, 6/16/25, Added GET route for fetching settings and improved auth handling

// routes/userSettings.js

import express from 'express';
import getUser from '../models/User.js';
import auth from '../middleware/auth.js';
import cookie from 'cookie';  // for setting cookies in the response
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Define rate limiter for settings operations
const settingsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
});

// GET route to fetch current user settings
router.get('/settings', auth(), settingsRateLimiter, async (req, res) => {
  try {
    const user = await getUser.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user settings data (only settings-relevant fields)
    const userSettings = {
      firstName: user.firstName,  // For display purposes in settings
      lastName: user.lastName,    // For display purposes in settings
      profilePic: user.profilePic, // Settings may allow changing profile pic
      preferences: {
        theme: user.preferences?.theme || 'default',
        aiMode: user.preferences?.aiMode || 'short',
        tone: user.preferences?.tone || 'neutral',
        fontSize: user.preferences?.fontSize || 'regular',
        notificationsEnabled: user.preferences?.notificationsEnabled !== false,
        language: user.preferences?.language || 'en'
      }
    };

    //// Prev code:
    // const userSettings = {
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   email: user.email,
    //   dateOfBirth: user.dateOfBirth,
    //   profilePic: user.profilePic,
    //   preferences: {
    //     theme: user.preferences?.theme || 'default',
    //     aiMode: user.preferences?.aiMode || 'short',
    //     tone: user.preferences?.tone || 'neutral',
    //     fontSize: user.preferences?.fontSize || 'regular',
    //     notificationsEnabled: user.preferences?.notificationsEnabled !== false,
    //     language: user.preferences?.language || 'en'
    //   }
    // };

    res.status(200).json(userSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error fetching settings', error: error.message });
  }
});

// PATCH route to update user settings
router.patch('/updateSettings', auth(), settingsRateLimiter, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      profilePic,
      preferences   // Main settings data
    } = req.body;

    //// Prev code:
    // const {
    //   firstName,
    //   lastName,
    //   dateOfBirth,
    //   profilePic,
    //   preferences
    // } = req.body;

    const user = await getUser.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic user fields if provided (settings-relevant only)
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (profilePic !== undefined) user.profilePic = profilePic;

    //// Prev code:
    // if (firstName !== undefined) user.firstName = firstName;
    // if (lastName !== undefined) user.lastName = lastName;
    // if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    // if (profilePic !== undefined) user.profilePic = profilePic;

    // Update preferences if provided
    if (preferences) {
      // Initialize preferences object if it doesn't exist
      if (!user.preferences) {
        user.preferences = {};
      }
      if (preferences.theme !== undefined) user.preferences.theme = preferences.theme;
      if (preferences.aiMode !== undefined) user.preferences.aiMode = preferences.aiMode;
      if (preferences.tone !== undefined) user.preferences.tone = preferences.tone;
      if (preferences.fontSize !== undefined) user.preferences.fontSize = preferences.fontSize;
      if (preferences.notificationsEnabled !== undefined) user.preferences.notificationsEnabled = preferences.notificationsEnabled;
      if (preferences.language !== undefined) user.preferences.language = preferences.language;
    }

    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error updating settings', error: error.message });
  }
});

export default router;
