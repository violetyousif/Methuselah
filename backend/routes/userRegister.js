// Violet Yousif & Viktor, 6/1/2025, merged code together and separated from login file
// Violet Yousif, 6/1/2025, handles user registration; checks if email exists, hashes password, and saves new user to db
// Violet Yousif, 6/1/2025, added rate limiting to prevent brute-force or credential-stuffing attacks by limiting the number of registration attempts


import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Rate limiting middleware to prevent abuse
// Prevents brute-force or credential-stuffing attacks by limiting the number of registration attempts
const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 15,                   // limit each IP to 5 registration attempts per minute
  message: 'Too many registration attempts from this IP. Please try again later.'
});

// Helper function to capitalize the first letter of a string
const capitalize = (str) => {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Description: handles user registration; checks if the email already exists, hashes password, and saves new user to db.
router.post('/register', registerLimiter, async (req, res) => {
  try {
    let {
        firstName,
        lastName,
        email,
        password,
        phoneNum,
        dateOfBirth,
        gender,
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
        gender,
        agreedToTerms
    });

    // Remove password from the response
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json({ 
      message: 'User successfully registered!', 
      user: userWithoutPassword 
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

export default router;

