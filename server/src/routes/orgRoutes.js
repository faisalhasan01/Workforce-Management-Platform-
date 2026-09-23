import express from 'express';
import {
  getUserOrgs,
  createOrg,
  switchActiveOrg,
  getOrgMembers,
  addOrgMember,
  updateMemberRole,
} from '../controllers/orgController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getUserOrgs);
router.post('/', createOrg);
router.post('/:id/switch', switchActiveOrg);
router.get('/:id/members', requireTenant, getOrgMembers);
router.post('/:id/members', requireTenant, authorizeRoles('Owner', 'Admin'), addOrgMember);
router.put('/:id/members/:userId/role', requireTenant, authorizeRoles('Owner', 'Admin'), updateMemberRole);

export default router;
