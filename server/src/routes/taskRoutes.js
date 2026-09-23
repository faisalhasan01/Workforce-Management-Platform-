import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  moveTask,
  addComment,
  toggleSubtask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router.get('/', getTasks);
router.post('/', authorizeRoles('Owner', 'Admin', 'Project Manager', 'Team Member'), createTask);
router.put('/:id', authorizeRoles('Owner', 'Admin', 'Project Manager', 'Team Member'), updateTask);
router.put('/:id/move', authorizeRoles('Owner', 'Admin', 'Project Manager', 'Team Member'), moveTask);
router.post('/:id/comments', addComment);
router.put('/:id/subtasks/:subtaskId', toggleSubtask);
router.delete('/:id', authorizeRoles('Owner', 'Admin', 'Project Manager'), deleteTask);

export default router;
