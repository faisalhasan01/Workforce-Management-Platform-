import express from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router.get('/', getProjects);
router.post('/', authorizeRoles('Owner', 'Admin', 'Project Manager'), createProject);
router.get('/:id', getProjectById);
router.put('/:id', authorizeRoles('Owner', 'Admin', 'Project Manager'), updateProject);
router.delete('/:id', authorizeRoles('Owner', 'Admin'), deleteProject);

export default router;
