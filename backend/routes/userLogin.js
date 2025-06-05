// Name: Viktor
// Date: 5/28/2025
// Description: handles user login route

// Edited by Violet Yousif, 5/31/2025
// Description: Fixed errors and converted imported files to ES module import/export syntax

import express from 'express';
const router = express.Router();
import User from '../models/User.js'; 
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 

// Prevents brute-force or credential-stuffing attacks by limiting the number of registration attempts
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,                  // Limit to 5 login attempts per IP per windowMs
  message: {
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// Description: handles user login by checking the provided email and password against the db.
// Edited By: Violet Yousif
// Date: 5/31/2025
// Edit: Downloaded validator dependency for error/security checks and added $eq operator to the email query to prevent injection attacks.
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('POST /api/login hit with:', req.body);

    if (typeof email !== 'string' || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      console.log('Invalid email format');
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email: { $eq: email.trim().toLowerCase() } });
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
    //Viktor 
    //Date 6/1/2025
    //session tokens are assigned to the user to only be signed in for 1 hour. Afterwhich, they will have to log back in again
    const token = jwt.sign( //creating variable token and assigning it with a generated token from sign
      { userId: user._id, email : user.email }, //assigning data User(collection) variable: _id and email to userId and email respectively
      process.env.JWT_SECRET, //Secret key to prove its from our server. (authentication)
      { expiresIn: '1h' } 
    );

    // Violet: Changed "user" to "User" to match the imported User model
    const {password: _, ...userWithoutPassword} = user.toObject(); //deconstructing the user object and creating a new user without a password variable
    res.status(200).json({message: 'Login Successful!', token, user: userWithoutPassword    }); //send the user data back to the client with the token
    } catch (err) {
      console.log('Server Error: ', err);
      res.status(500).json({ error: err.message });
    }

});


export default router;


// Name: Viktor
// Date: 5/28/2025
// Description: test
/*
app.post('/api/users', async (req, res) => {
  try {
    console.log('Incoming data:', req.body);
    const { name, email, password } = req.body;

    const newUser = await User.create({ name, email, password });

    res.status(201).json({ message: 'User successfully created', data: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});
*/

// used to test sign up route
/*
fetch('http://localhost:8080/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'securepassword'
  })
})
.then(res => res.json())
.then(data => console.log('SUCCESS SIGN UP:', data))
.catch(err => console.error('ERROR:', err));
*/

//used to test login:
/*
fetch('http://localhost:8080/api/userLogin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'testuser@example.com',
    password: 'securepassword'
  })
})
.then(res => res.json())
.then(data => console.log('SUCCESSFUL LOGIN:', data))
.catch(err => console.error('ERROR:', err));
 */