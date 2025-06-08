// Violet Yousif, 6/8/2025, handles user authentication by checking if the user is logged in and returns user data if valid

import express from 'express';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.get('/checkAuth', async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;
    if (!token) return res.status(401).json({ message: 'No user logged in' });

    // Verify the token using jwt.verify that sends to "Users.js"
    // Then mongoose in Users.js will find the user by the userId in the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password'); // Using minus to exclude password from the response
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
