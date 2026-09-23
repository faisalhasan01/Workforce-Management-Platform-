import express from 'express';
import {
  getSprints,
  createSprint,
  startSprint,
  completeSprint,
  deleteSprint,
} from '../controllers/sprintController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router.get('/', getSprints);
router.post('/', authorizeRoles('Owner', 'Admin', 'Project Manager'), createSprint);
router.put('/:id/start', authorizeRoles('Owner', 'Admin', 'Project Manager'), startSprint);
router.put('/:id/complete', authorizeRoles('Owner', 'Admin', 'Project Manager'), completeSprint);
router.delete('/:id', authorizeRoles('Owner', 'Admin'), deleteSprint);

export default router;
