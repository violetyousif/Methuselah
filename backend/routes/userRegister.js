// Name: Violet Yousif & Viktor (merged code together and separated from login file)
// Date: 6/1/2025
// Description: handles user registration; checks if the email already exists, 
// hashes password, and saves new user to db.
import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Name: Violet Yousif
// Date: 6/1/2025
// Description: rate limiting middleware to prevent abuse
// (Prevents brute-force or credential-stuffing attacks by limiting the number of registration attempts)
const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 15,                   // limit each IP to 5 registration attempts per minute
  message: 'Too many registration attempts from this IP. Please try again later.'
});

router.post('/register', registerLimiter, async (req, res) => {
  try {
    let {
        firstName,
        lastName,
        email,
        password,
        phoneNum,
        dateOfBirth,
        agreedToTerms,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: { $eq: email } });
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the user
    const user = await User.create({
        firstName : capitalize(firstName),
        lastName: capitalize(lastName),
        email: email.toLowerCase(),
        password: hashedPassword,
        phoneNum,
        dateOfBirth,
        agreedToTerms
    });

    res.status(201).json({ message: 'User successfully registered!', user });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

export default router;

