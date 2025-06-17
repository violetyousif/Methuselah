// /backend/routes/userLogout.js

// Violet Yousif, 6/8/2025, handles user logout by clearing the authentication cookie that's holding the JWT token


import express from 'express';

const router = express.Router();

// Description: handles user logout by clearing the authentication cookie that's holding the JWT token
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    //expires: new Date(0), // Forces cookie to expire -- update: not needed as clearCookie from express does this automatically
    path: '/',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
