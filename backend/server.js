// Server.js: Backend file that contains routes and calls to perform database functions
// Created by Viktor, 5/28/2025

// Edited by Violet Yousif, 5/31/2025
// Description: Fixed errors and converted imported CommonJS to ES module syntax
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';  // for database connection and operations
import cors from 'cors';          // for cross origin requests
import bcrypt from 'bcrypt';      // to encrypt passwords
import jwt from 'jsonwebtoken';   // security: make sure user is logged in to access app session
import path from 'path';
import { fileURLToPath } from 'url';
//import { Types } from 'mongoose'; // for ObjectId type in mongoose
 
import logger from './middleware/logger.js';
//import auth from './middleware/auth';
//import User from './middleware/User';
import userLogin from './routes/userLogin.js';
import userRegister from './routes/userRegister.js';

// Description: Set up the express app and connect to MongoDB
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Description: Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '/.env.local') });

// Description: Create an instance of express app and set up middleware
const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
//app.use(cors());
app.use(logger);  // Logs all incoming requests

// Description: MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connecontion Error:", err));

// Debugging: confirm MongoDB URI is loaded correctly
console.log("Mongo URI:", process.env.MONGODB_URI); 

// Description: Default Route
app.get('/', (req, res) => {
    res.send('Welcome to the Methuselah Backend API!');
  });

// Protected Routes
app.use('/api', userLogin);
app.use('/api', userRegister);

// Description: Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


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

