// Edited by: Viktor Gjorgjevski
// Date: 06/12/2025
// Added POST route for submitting feedback using authentication middleware

// Edited by: Viktor Gjorgjevski
// Date: 06/18/2025
// Future proofed incase structure ever changes. CHanged middle ware by using auth instead of old authmiddleware

// Edited by: Viktor Gjorgjevski
// Date: 06/22/2025
// Added rate limiting to prevent abuse of the API

import express from 'express';
const router = express.Router();
import rateLimit from 'express-rate-limit';


import Feedback from '../models/feedback.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const feedbackLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // Limit to 1 submission per IP every 24 hours
  message: {
    message: 'Feedback is limited to one submission every 24 hours. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// POST /feedback
// This route accepts feedback from logged-in users and stores it in the database
router.post('/feedback', feedbackLimiter, auth(), async (req, res) => {
    try{
        // Destructure feedback data from request body
        const {rating, comments, sessionID, conversationID} = req.body;

         // Retrieve user from token payload set by authMiddleware
        const user = await User.findById(req.user?.id);
        if (!user) return res.status(404).json({message: "User not found"});

        // Create a new feedback document and save it to the database
        const newFeedback = new Feedback({
            userId: user._id,
            sessionId: sessionID,
            conversationId: conversationID,
            rating,
            comments,
        });
        await newFeedback.save(); // Save feedback to the database
        res.status(201).json({message: "Feedback submitted successfully"});
    }
    catch(err){
        console.error('Feedback submission error:', err);
        res.status(500).json({ error: 'Server error submitting feedback' });
    }
});
export default router;
