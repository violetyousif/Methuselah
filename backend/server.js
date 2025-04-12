//backend file that contains routes and call to perform database functions

require('dotenv').config({ path: __dirname + '/.env' });
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
