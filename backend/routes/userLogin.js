const express = require('express');
const router = express.Router() 

const User = require('../models/User'); //loads the user model that represents users table in mongo db
const bcrypt = require('bcrypt'); //loads the bcrypt library to hash passwords

const jwt = require('jsonwebtoken'); //loads the jsonwebtoken library to create and verify tokens
//userLogin.js done by Viktor

//user sign up route
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

//used to test sign up route
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




// Login route
// TODO: Will revisit this to fix and download validator dependency for error handling/security check --Violet
/*router.post('/login', async (req, res) => {
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
*/


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



module.exports = router; 
