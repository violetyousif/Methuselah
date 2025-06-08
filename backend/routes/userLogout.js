// /backend/routes/userLogout.js

// Violet Yousif, 6/8/2025, handles user logout by clearing the authentication cookie that's holding the JWT token


import express from 'express';
import cookie from 'cookie';

const router = express.Router();

// Description: handles user logout by clearing the authentication cookie that's holding the JWT token
router.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', cookie.serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    expires: new Date(0), // Forces cookie to expire
    path: '/',
  }));
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
