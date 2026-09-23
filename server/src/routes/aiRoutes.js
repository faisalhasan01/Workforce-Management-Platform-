import express from 'express';
import { generateSubtasks, generateDailyStandup } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router.post('/subtasks', generateSubtasks);
router.post('/standup', generateDailyStandup);

export default router;
