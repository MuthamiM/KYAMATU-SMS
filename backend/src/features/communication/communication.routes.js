import { Router } from 'express';
import * as communicationController from './communication.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isTeacher } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/announcements', isTeacher, communicationController.createAnnouncement);
router.get('/announcements', communicationController.getAnnouncements);
router.put('/announcements/:id/publish', isAdmin, communicationController.publishAnnouncement);
router.delete('/announcements/:id', isAdmin, communicationController.deleteAnnouncement);

router.post('/messages', communicationController.sendMessage);
router.get('/messages/inbox', communicationController.getInbox);
router.get('/messages/sent', communicationController.getSentMessages);
router.put('/messages/:id/read', communicationController.markAsRead);
router.get('/messages/unread-count', communicationController.getUnreadCount);

export default router;
