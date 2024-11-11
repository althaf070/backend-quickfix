import express from 'express';
import { verifyToken } from '../middleware/verifytoken.js';
import { getUserDashboardData, getUserLogs } from '../controllers/logController.js';

const router = express.Router();

router.get('/get',verifyToken,getUserLogs)
router.get('/dashboard',verifyToken,getUserDashboardData)



export default router