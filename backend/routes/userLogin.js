// Edited by Violet, 5/31/2025
// Description: Fixed errors and converted imported files to ES module import/export syntax

import express from 'express';
const router = express.Router();

import User from '../models/User.js'; // loads the user model that represents users table in mongo db
import bcrypt from 'bcrypt'; // loads the bcrypt library to hash passwords

import jwt from 'jsonwebtoken'; // loads the jsonwebtoken library to create and verify tokens

// Apply logger globally
app.use(logger);

// Protect some routes with auth
const userLogin = require('./routes/userLogin');
app.use('/api', auth, userLogin);  // This protects all /api routes


// Name: Viktor
// Date: 5/28/2025
// Description: handles storing user registration in database with hashed password.
router.post('/signup', async (req, res) =>{
    try{
        const {name, password, email} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({name, email, password: hashedPassword});

        res.status(201).json({message: 'User signed up successfully', user: newUser}); 
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
});

// used to test sign up route
/*
fetch('http://localhost:8080/api/signup', {
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



// Name: Viktor
// Date: 5/28/2025
// Description: This route handles user login by checking the provided email and password against the database.
// Edited By: Violet
// Date: 5/31/2025
// Edit: Downloaded validator dependency for error/security checks and added $eq operator to the email query to prevent injection attacks.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find the user by email in database
    const user = await User.findOne({ email: { $eq: email } });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Send success response
    res.status(200).json({ message: 'Login successful', user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Viktor
// Description: test
app.post('/api/users', async (req, res) => {
  try {

    console.log('💡 Incoming data:', req.body);
    const { name, email, password } = req.body;

    const newUser = await User.create({ name, email, password });

    res.status(201).json({ message: 'User successfully created', data: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

//used to test login:
/*
fetch('http://localhost:8080/api/login', {
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

export default router;
