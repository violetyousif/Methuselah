// Violet Yousif, 7/20/2025, Added status checks route for system and database monitoring

import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/statusChecks', async (req, res) => {
  // Check database connection
  let dbStatus = 'Disconnected';
  if (mongoose.connection.readyState === 1) dbStatus = 'Connected';
  else if (mongoose.connection.readyState === 2) dbStatus = 'Connecting';
  else if (mongoose.connection.readyState === 3) dbStatus = 'Disconnecting';

  // You can add more system checks here if needed
  res.json({
    systemStatus: 'Online', // You can add more logic for system health if needed
    databaseStatus: dbStatus,
    lastUpdated: new Date().toISOString(),
  });
});

export default router;