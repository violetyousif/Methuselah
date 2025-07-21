// Violet Yousif, 6/16/2025, Created profile endpoint for saving user profile data
// Mohammad Hoque, 6/18/2025, Added gender field to the profile endpoint 
// Mohammad Hoque, 6/19/2025, Replaced age with dateOfBirth in profile endpoint
// Syed Rabbey, 7/1/2025, Created endpoint for user profile updates to save in HealthMetricHistory collection for dashboard insights

// backend/routes/userProfile.js
import express from 'express';
import getUser from '../models/User.js';
import HealthMetric from '../models/HealthMetric.js';
import HealthMetricHistory from '../models/HealthMetricHistory.js';
import auth from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Define rate limiter: maximum of 20 requests per 15 minutes
const profileRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
});

router.patch('/profile', profileRateLimiter, auth(), async (req, res) => {
  console.log('User making profile update:', req.user.id);
  try {
    const { dateOfBirth, gender, height, activityLevel, healthGoal, supplements, medicine } = req.body;
    const user = await getUser.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user profile data
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (height !== undefined) user.height = height;
    if (activityLevel !== undefined) user.activityLevel = activityLevel;
    if (healthGoal !== undefined) user.healthGoal = healthGoal;
    if (supplements !== undefined) user.supplements = supplements;
    if (medicine !== undefined) user.medicine = medicine;

    user.updatedAt = new Date();
    await user.save();
    // Save health metrics as time-series data to act as audit trail for dashboard.
    const healthMetricsUpdate = {};

    if (activityLevel !== undefined) healthMetricsUpdate.activityLevel = activityLevel;

    healthMetricsUpdate.lastUpdated = new Date();
    healthMetricsUpdate.source = 'profile';

    console.log('Metrics being upserted:', healthMetricsUpdate);

    await HealthMetric.findOneAndUpdate(
      { userId: user._id },
      { $set: healthMetricsUpdate },
      { upsert: true, new: true }
    );

    // Save to HealthMetricsHistory (audit trail) for dashboard insights.
    const historyEntries = [];

    if (activityLevel !== undefined) {
      historyEntries.push({
        userId: user._id,
        metric: 'activityLevel',
        value: activityLevel,
        unit: '', // No unit for activity level
        recordedAt: new Date(),
        source: 'profile'
      });
    }

    if (historyEntries.length > 0) {
      await HealthMetricHistory.insertMany(historyEntries);
    }

  
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

