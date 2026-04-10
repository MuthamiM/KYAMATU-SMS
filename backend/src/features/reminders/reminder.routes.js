import express from 'express';
import * as reminderController from './reminder.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('STUDENT'), reminderController.getMyReminders);
router.post('/', requireRole('STUDENT'), reminderController.createReminder);
router.patch('/:id', requireRole('STUDENT'), reminderController.updateReminder);
router.patch('/:id/complete', requireRole('STUDENT'), reminderController.markCompleted);
router.delete('/:id', requireRole('STUDENT'), reminderController.deleteReminder);

export default router;
