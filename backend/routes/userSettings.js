// Mizanur Mizan, 6/11/25 ,Description: Created the backend route for settings page
// Violet Yousif, 6/14/25, Added fixes to token call in a cookie with JWT_SECRET, fixed import/export syntax

// routes/userSettings.js

import express from 'express';
import getUser from '../models/User.js';
import auth from '../middleware/auth.js';
import cookie from 'cookie';  // for setting cookies in the response

const router = express.Router();

router.patch('/updateSettings', async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;  // Get the token from the cookie
    if (!token) {
      return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userID;

    const {
        firstName,
        lastName,
        dateOfBirth,
        profilePic,
        preferences: {
          theme,
          fontSize
        },
    } = req.body;


    const updatedUser = await getUser.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        dateOfBirth,
        profilePic,
        preferences: {
          theme,
          fontSize
        },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Settings updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ message: 'Server error updating settings', error: err.message });
  }
});

export default router;