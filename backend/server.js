// Viktor, 5/28/2025, Backend file that contains routes and calls to perform database functions
// Violet Yousif, 5/31/2025, Fixed errors and converted imported CommonJS to ES module syntax
// Mohammad Hoque, 6/13/2025, Added userProfile route to handle profile fetch and update
// Violet Yousif, 6/16/2025, Added cookie-parser to handle auth cookies

// Edited by: Viktor Gjorgjevski
// Date: 06/12/2025
// import for feedback and route api

// Edited by: Viktor Gjorgjevski
// Date: 06/18/2025
// updated feedback and route api

// Edited by: Viktor Gjorgjevski
// Date: 06/23/2025
// Added RAG and LLM

import dotenv from 'dotenv';
import path from 'path';


// Description: Set up the express app and connect to MongoDB
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Description: Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '/.env.local') });

import healthMetricsInsightsRoute from './routes/healthMetricsInsights.js';
import express from 'express';
import mongoose from 'mongoose';  // for database connection and operations
import { MongoClient } from 'mongodb';
import cors from 'cors';          // for cross origin requests
import bcrypt from 'bcrypt';      // to encrypt passwords
import jwt from 'jsonwebtoken';   // security: make sure user is logged in to access app session
import { fileURLToPath } from 'url';
 
// Importing routes and middleware
import logger from './middleware/logger.js';
import userLogin from './routes/userLogin.js';
import userRegister from './routes/userRegister.js';
import userLogout from './routes/userLogout.js';
import userLoginRoutes from './routes/userLogin.js';
import checkAuth from './routes/checkAuth.js';
import userSettings from './routes/userSettings.js';
import userData from './routes/userData.js';
import userProfile from './routes/userProfile.js';
import feedbackRoutes from './routes/feedback.js';
import ragSearch from './routes/ragSearch.js';
import ragChat   from './routes/ragChat.js';
import healthMetrics from './routes/healthMetrics.js';
import authRoutes from './routes/authRoutes.js';  // Importing auth routes for user authentication

// Importing cookie-parser to handle auth cookies
import cookieParser from 'cookie-parser';

// Description: Set up the express app and connect to MongoDB



// 🔍 DEBUG: Log env values to verify .env is working
console.log("MAIL_USER:", process.env.MAIL_USER);
console.log("MAIL_PASS exists?", Boolean(process.env.MAIL_PASS));

console.log('TESTING ENV', process.env.MAIL_USER);


// Description: Create an instance of express app and set up middleware
const app = express();
app.use(cookieParser());
app.use(cors({ 
  origin: 'http://localhost:3000', 
  credentials: true 
}));
app.use(express.json());
app.use('/api/auth', userLoginRoutes);
app.use(logger);  // Logs all incoming requests



// Description: MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB Connecontion Error:", err));

// Debugging: confirm MongoDB URI is loaded correctly
console.log("Mongo URI:", process.env.MONGODB_URI); 

// Description: Default Route
app.get('/', (req, res) => {
    res.send('Welcome to the Methuselah Backend API!');
  });

// Protected Routes
app.use('/api', userRegister);
app.use('/api', userLogout);
app.use('/api', checkAuth);
app.use('/api', userSettings);
app.use('/api', userData);
app.use('/api', userProfile);
app.use('/api', feedbackRoutes);
app.use('/api', ragSearch);
app.use('/api', ragChat);
app.use('/api', healthMetricsInsightsRoute);
app.use('/api', healthMetrics);
app.use('/api/auth', authRoutes);


// Description: Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));