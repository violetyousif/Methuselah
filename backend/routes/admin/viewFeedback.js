// /routes/admin/viewFeedback.js
// Mohammad Hoque, 07/18/2025, Created admin route to view all user feedback

import express from 'express';
import auth from '../../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import Feedback from '../../models/Feedback.js';
import User from '../../models/User.js';

const router = express.Router();

// Configure rate limiter: maximum of 100 requests per 15 minutes
const feedbackRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});

// GET /feedback - Retrieve all feedback for admin review
router.get('/feedback', feedbackRateLimiter, auth('admin'), async (req, res) => {
  try {
    // Fetch all feedback and populate user information
    const feedback = await Feedback.find()
      .populate('userId', 'firstName lastName email') // Get user details
      .populate('conversationId', 'title') // Get conversation title if available
      .sort({ createdAt: -1 }); // Sort by newest first

    // Transform the data to include user info directly and handle missing user data
    const feedbackWithUserInfo = feedback.map(item => ({
      _id: item._id,
      rating: item.rating || 0,
      comments: item.comments || '',
      createdAt: item.createdAt,
      conversationId: item.conversationId,
      user: {
        firstName: item.userId?.firstName || 'Unknown',
        lastName: item.userId?.lastName || 'User',
        email: item.userId?.email || 'No email'
      }
    }));

    res.status(200).json({
      success: true,
      count: feedbackWithUserInfo.length,
      data: feedbackWithUserInfo
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error fetching feedback',
      message: error.message 
    });
  }
});

export default router;
