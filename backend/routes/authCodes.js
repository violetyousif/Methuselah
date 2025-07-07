//Syed Rabbey, 07/04/2025, File for handling POST /verify-reset-code and POST /update-password routes for password reset functionality
//Syed Rabbey, 07/07/2025, Added storage for reset codes.
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Replace with your actual user model
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import resetCodes from '../utils/resetCodes.js';

const router = express.Router();



// Verify reset code
router.post('/verify-reset-code', (req, res) => {
  const { email, code } = req.body;
  const stored = resetCodes.get(email);
  if (stored && stored === code) {
    res.json({ success: true });
  } else {
    res.status(400).json({ message: 'Invalid or expired code' });
  }
});


const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // only 3 attempts per IP per 15 mins
  message: {
    message: 'Too many password reset attempts. Try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Update password
router.post('/update-password', passwordResetLimiter, async (req, res) => {
  const { email, newPassword } = req.body;

  if (typeof email !== 'string' || !validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const user = await User.findOne({ email: { $eq: email } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, { httpOnly: true });
  res.json({ message: 'Password updated and logged in.' });
});

export default router;
