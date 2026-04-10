import express from 'express';
import * as aiController from './ai.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.post('/chat', requireRole('STUDENT'), aiController.chat);
router.get('/chat/history', requireRole('STUDENT'), aiController.getHistory);

export default router;
