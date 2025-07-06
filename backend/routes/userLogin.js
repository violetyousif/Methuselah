// Viktor, 5/28/2025, handles user login route
// Violet Yousif, 5/31/2025, Fixed errors and converted imported files to ES module import/export syntax
// Violet Yousif, 5/31/2025, Added express-rate-limit to prevent brute-force attacks on login
// Viktor, 6/1/2025, session tokens are assigned to the user to only be signed in for 1 hour. Afterwhich, they will have to log back in again
// Violet Yousif, 6/8/2025, Added error handling for token signing and set token in a cookie with JWT_SECRET
// Violet Yousif, 6/16/2025, Removed cookie dependency and used res.cookie() directly from server.js and middleware

import express from 'express';
const router = express.Router();
import getUser from '../models/User.js'; 
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken';
//import cookie from 'cookie'; // Don't need anymore, using res.cookie() directly from server.js and middleware

// prevent brute-force or credential-stuffing attacks by limiting the number of registration attempts
import rateLimit from 'express-rate-limit';


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,   // Limit to 15 login attempts per IP per windowMs
  message: {
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// Description: handles user login by checking the provided email and password against the db.
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('POST /api/login hit with:', req.body);

    if (typeof email !== 'string' || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      console.log('Invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await getUser.findOne({ email: { $eq: email.trim().toLowerCase() } });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'User not found' });
    }

    // Checks password against the hashed password stored in the database
    // and uses bcrypt.compare to decode and verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password');
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Session tokens are assigned to the user to only be signed in for 1 hour before expiration
    let token;
    try {
      token = jwt.sign(
        // Assigning data User(collection) variable: _id and email to userId and email respectively
        {  userId: user._id, email: user.email.toLowerCase(), role: user.role },
        process.env.JWT_SECRET, // Secret key to prove its from our server (authentication)
        { expiresIn: '1h' }     // Token will expire in 1 hour
        );
    }
    catch (error) {
      console.log(err);
      console.error('Error signing token:', error);
      return res.status(500).json({ message: 'Error signing token' }
      );
    }
    // Set the token in a cookie with JWT_SECRET
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
      path: '/',
    });

    const {password: _, ...userWithoutPassword} = user.toObject(); // Send user data (excluding password) in response
    
    res.status(200).json({    // description: Send a success message with user data (excluding password)
      message: 'Login successful!',
      user: userWithoutPassword
    });
    } catch (err) {
      console.log('Server Error: ', err);
      res.status(500).json({ error: err.message });
    }

});

export default router;
