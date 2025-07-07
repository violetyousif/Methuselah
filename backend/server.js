// Viktor, 5/28/2025, Backend file that contains routes and calls to perform database functions
// Violet Yousif, 5/31/2025, Fixed errors and converted imported CommonJS to ES module syntax
// Viktor Gjorgjevski, 06/12/2025, import for feedback and route api
// Mohammad Hoque, 6/13/2025, Added userProfile route to handle profile fetch and update
// Violet Yousif, 6/16/2025, Added cookie-parser to handle auth cookies
// Viktor Gjorgjevski, 06/18/2025, updated feedback and route api
// Viktor Gjorgjevski, 06/23/2025, Added ragChat and ragSearch routes for RAG functionality
// Violet Yousif, 7/6/2025, Added admin route directory

import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';  // for database connection and operations
import cors from 'cors';          // for cross origin requests
import path from 'path';
import { fileURLToPath } from 'url';
 
// Importing routes and middleware
import logger from './middleware/logger.js';
import userLogin from './routes/userLogin.js';
import userRegister from './routes/userRegister.js';
import userLogout from './routes/userLogout.js';
import checkAuth from './routes/checkAuth.js';
import userSettings from './routes/userSettings.js';
import userData from './routes/userData.js';
import userProfile from './routes/userProfile.js';
import feedbackRoutes from './routes/feedback.js';
import ragSearch from './routes/ragSearch.js';
import ragChat   from './routes/ragChat.js';
import healthMetrics from './routes/healthMetrics.js';
import userChatHist from './routes/userChatHist.js';
import adminServer from './routes/adminServer.js';

// Importing cookie-parser to handle auth cookies
import cookieParser from 'cookie-parser';

// Description: Set up the express app and connect to MongoDB
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Description: Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '/.env.local') });

// Description: Create an instance of express app and set up middleware
const app = express();
app.use(cookieParser());
app.use(cors({ 
  origin: 'http://localhost:3000', 
  credentials: true 
}));
app.use(express.json());
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

// Protected User Routes
app.use('/api', userLogin);
app.use('/api', userRegister);
app.use('/api', userLogout);
app.use('/api', checkAuth);
app.use('/api', userSettings);
app.use('/api', userData);
app.use('/api', userProfile);
app.use('/api', feedbackRoutes);
app.use('/api', ragSearch);
app.use('/api', ragChat);
app.use('/api', healthMetrics);
app.use('/api', userChatHist);

// Admin Routes
app.use('/api', adminServer); 


// Description: Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));