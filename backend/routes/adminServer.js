// Violet Yousif, 7/6/2025, Added admin route directory and page names and MongoDB script to create role assignment for current and future users with enum type [user, admin].

// /routes/adminServer.js
import express from 'express';
import authAdmin from './admin/authAdmin.js';
import graphStats from './admin/graphStats.js';
//import queryStats from './admin/queryStats.js';
import uploadData from './admin/uploadData.js';

const router = express.Router();

// All admin routes are prefixed with /admin
router.use('/admin', authAdmin);
router.use('/admin', graphStats);
//router.use('/admin', queryStats);
router.use('/admin', uploadData);

export default router;
