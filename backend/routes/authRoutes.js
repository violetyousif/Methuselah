//Syed Rabbey, 07/04/2025, File for handling POST /verify-reset-code and POST /update-password routes for password reset functionality
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Replace with your actual user model
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

// Update password
router.post('/update-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
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
