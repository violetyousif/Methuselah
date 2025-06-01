// Name: Violet Yousif & Viktor (had combined logic and separated from login route)
// Date: 6/1/2025
// Description: handles user registration; checks if the email already exists, 
// hashes password, and saves new user to db.
import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from './models/User.js';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) 
        return res.status(409).json({ message: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: 'User successfully registered!', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'register failed', error: err.message });
  }
});

export default router;
