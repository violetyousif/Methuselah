// /routes/admin/authAdmin.js
import express from 'express';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.get('/auth', auth('admin'), (req, res) => {
  res.status(200).json({ isAdmin: true, email: req.user.email });
});

export default router;
