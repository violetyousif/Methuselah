// /routes/admin/graphStats.js
import express from 'express';
import auth from '../../middleware/auth.js';
import User from '../../models/User.js';

const router = express.Router();

router.get('/graph-stats', auth('admin'), async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

    const stats = await User.aggregate([
      { $match: { createdAt: { $gte: lastMonth } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }},
        registrations: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({ stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
