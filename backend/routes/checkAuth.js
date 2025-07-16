// PURPOSE: Used by the frontend (usually useEffect) to check "Is user still logged in?" and returns their info.

// Violet Yousif, 6/8/2025, handles user authentication by checking if the user is logged in and returns user data if valid
// Violet Yousif, 6/14/2025, Added fixes to token call in a cookie with JWT_SECRET. Uses the cookie dependency to get the token directly from the cookie.
// Violet Yousif, 6/16/2025, Removed cookie dependency and used auth middleware to check token validity

import express from 'express';
//import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import getUser from '../models/User.js';
import rateLimit from 'express-rate-limit';
import auth from '../middleware/auth.js'; // Importing auth middleware to protect the route

const router = express.Router();

// Define rate limiter: maximum of 100 requests per 15 minutes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
});

router.get('/checkAuth', authRateLimiter, auth(), async (req, res) => {
  try {
    //const cookies = cookie.parse(req.headers.cookie || ''); // parse cookies from the request headers
    //const token = cookies.token;

    // Verify the token using jwt.verify that sends to "Users.js"
    // Then mongoose in Users.js will find the user by the userId in the token
    //const decoded = jwt.verify(token, process.env.JWT_SECRET);
const userDoc = await getUser.findById(req.user.id).lean();

if (!userDoc) {
  return res.status(404).json({ message: 'User not found' });
}

const { password, __v, ...safeUser } = userDoc;

res.status(200).json({ user: safeUser });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Send the user data back to the client
    console.log('User authenticated successfully:', user); // For debugging purposes
    res.status(200).json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
