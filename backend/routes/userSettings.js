// Mizanur Mizan, 6/11/25, Description: Created the backend route for settings page
// Violet Yousif, 6/14/25, Added fixes to token call in a cookie with JWT_SECRET, fixed import/export syntax
// Violet Yousif, 6/16/25, Added GET route for fetching settings and improved auth handling
// Mizanur Mizan, 7/14/2025-7/16/2025, Added verification for email change and change password button functionality

// routes/userSettings.js

import express from 'express';
import getUser from '../models/User.js';
import auth from '../middleware/auth.js';
import cookie from 'cookie';  // for setting cookies in the response
import rateLimit from 'express-rate-limit';
const emailVerificationStore = new Map();
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

const router = express.Router();

// Define rate limiter for settings operations
const settingsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
});

// GET route to fetch current user settings
router.get('/settings', settingsRateLimiter, auth(), async (req, res) => {
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
      email: user.email,           // Display email in settings
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

router.post('/sendEmailVerification', settingsRateLimiter, auth(), async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required.' });

  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store code with userId for security
  emailVerificationStore.set(email, { code, expires, userId: req.user.id });

  // Send email (configure transporter for your SMTP)
  const transporter = nodemailer.createTransport({
    // Configure your SMTP here
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Methuselah Verification Code',
      text: `Your 6-digit verification code is: ${code}`,
    });
    res.json({ message: 'Verification code sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

router.post('/verifyEmailCode', settingsRateLimiter, auth(), async (req, res) => {
  const { email, code } = req.body;
  const record = emailVerificationStore.get(email);
  if (
    !record ||
    record.code !== code ||
    record.expires < Date.now() ||
    record.userId !== req.user.id
  ) {
    return res.status(400).json({ message: 'Invalid or expired code.' });
  }
  // Mark as verified (could set a flag in DB or session, here just delete)
  const updatedRecord = { ...record, verified: true };
  emailVerificationStore.set(email, updatedRecord);
  res.json({ message: 'Email verified.' });
});

router.patch('/changeSettingsPassword', settingsRateLimiter, auth(), async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = await getUser.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

  // Check new password confirmation
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New passwords do not match.' });
  }
  // Set new password and save
  // user.password = newPassword;
  // await user.save();
  // res.json({ message: 'Password changed successfully.' });
  // Hash and update password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Hash the new password before saving
  // const hashedPassword = await bcrypt.hash(newPassword, 10);
  // user.password = hashedPassword;
  // await user.save();
  res.json({ message: 'Password changed successfully.' });
});

// PATCH route to update user settings
router.patch('/updateSettings', settingsRateLimiter, auth(), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
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
    // if (email !== undefined) user.email = email;
    // Check if email is being changed and is already used by another user
/*     if (email !== undefined && email !== user.email) {
      const existingUser = await getUser.findOne({ email: { $eq: email } });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use by another account.' });
      }
      user.email = email;
    } */
    // Only allow email change if verified
    if (email !== undefined && email !== user.email) {
      const existingUser = await getUser.findOne({ email: { $eq: email } });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use by another account.' });
      }
      // Check verification
      const record = emailVerificationStore.get(email);
      if (!record || !record.verified || record.userId !== req.user.id) {
        return res.status(400).json({ message: 'Email not verified.' });
      }
      user.email = email;
      // Clean up
      emailVerificationStore.delete(email);
    }
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
