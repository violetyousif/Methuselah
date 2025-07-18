// Violet Yousif, 7/6/2025, Added admin route directory and page names and MongoDB script to create role assignment for current and future users with enum type [user, admin].
// Mohammad Hoque, 07/18/2025, Added userStats route for dashboard statistics

// /routes/adminServer.js
import express from 'express';
import authAdmin from './admin/authAdmin.js';
import graphStats from './admin/graphStats.js';
//import queryStats from './admin/queryStats.js';
import uploadData from './admin/uploadData.js';
import uploadURL from './admin/uploadURL.js';
import viewFeedback from './admin/viewFeedback.js';
import userStats from './admin/userStats.js';
import manageChunks from './admin/manageChunks.js';

const router = express.Router();

// All admin routes are prefixed with /admin
// Because it's called prior through /api in server.js
// This allows us to have a single entry point for all admin routes
router.use('/admin', authAdmin);
router.use('/admin', graphStats);
//router.use('/admin', queryStats);
router.use('/admin', uploadData);
router.use('/admin', uploadURL);
router.use('/admin', viewFeedback);
router.use('/admin', userStats);
router.use('/admin', manageChunks);

export default router;
