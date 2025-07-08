// /routes/admin/authAdmin.js
import express from 'express';
import auth from '../../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Configure rate limiter: maximum of 100 requests per 15 minutes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});

router.get('/auth', authRateLimiter, auth('admin'), (req, res) => {
  res.status(200).json({ isAdmin: true, email: req.user.email });
});

export default router;
