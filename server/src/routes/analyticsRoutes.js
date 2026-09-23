import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router.get('/dashboard', getDashboardAnalytics);

export default router;
