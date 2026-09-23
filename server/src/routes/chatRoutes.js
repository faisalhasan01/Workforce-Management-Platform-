import express from 'express';
import {
  getChannels,
  getChannelMessages,
  postMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router.get('/channels', getChannels);
router.get('/channels/:channel/messages', getChannelMessages);
router.post('/channels/:channel/messages', postMessage);

export default router;
