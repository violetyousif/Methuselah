// Name: Violet Yousif & Viktor (merged code together and separated from login file)
// Date: 6/1/2025
// Description: handles user registration; checks if the email already exists, 
// hashes password, and saves new user to db.
import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from './models/User.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Name: Violet Yousif
// Date: 6/1/2025
// Description: rate limiting middleware to prevent abuse
const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 registration attempts per minute
  message: 'Too many registration attempts from this IP. Please try again later.'
});

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const {
        firstName,
        lastName,
        email,
        password,
        phoneNum,
        country,
        dateOfBirth,
        agreedToTerms,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: { $eq: email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the user
    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNum,
        country,
        dateOfBirth,
        agreedToTerms
    });

    res.status(201).json({ message: 'User successfully registered!', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

export default router;

