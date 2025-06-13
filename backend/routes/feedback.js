// Edited by: Viktor Gjorgjevski
// Date: 06/12/2025
// Added POST route for submitting feedback using authentication middleware

import express from 'express';
const router = express.Router();

import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

// POST /submit-feedback
// This route accepts feedback from logged-in users and stores it in the database
router.post('/submit-feedback', authMiddleware, async (req, res) => {
    try{
        // Destructure feedback data from request body
        const {rating, comments, sessionID, conversationID} = req.body;

         // Retrieve user from token payload set by authMiddleware
        const user = await User.findById(req.user.userId);
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
