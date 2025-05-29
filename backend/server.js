//backend file that contains routes and call to perform database functions

//Done by Viktor

require('dotenv').config({ path: __dirname + '/.env.local' });
console.log("Mongo URI:", process.env.MONGODB_URI);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // for cross origin requests
const bcrypt = require('bcrypt'); // to encrypt passwords
const jwt = require('jsonwebtoken'); //for security purpose to make sure the user is logged in to access the application
const { Types } = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connecontion Error:", err));

// Default Route
app.get('/', (req, res) => {
    res.send('Welcome to the Financial Tracker Backend API!');
  });

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));






//Viktor
//testing for db connection
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema, 'Users');



// test
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


//use for database connection test

/*fetch('http://localhost:8080/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Now It Works',
    email: 'now@real.com',
    password: 'check123'
  })
})
.then(res => res.json())
.then(data => console.log('WORKED', data))
.catch(err => console.error('DID NOT WORK', err));
 */

