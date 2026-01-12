import { Router } from 'express';
import * as staffController from './staff.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isTeacher } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/', isAdmin, staffController.createStaff);
router.get('/', isAdmin, staffController.getStaff);
router.get('/my-classes', isTeacher, staffController.getMyClasses);
router.get('/:id', isAdmin, staffController.getStaffMember);
router.put('/:id', isAdmin, staffController.updateStaff);
router.delete('/:id', isAdmin, staffController.deleteStaff);

router.post('/assignments', isAdmin, staffController.assignTeacher);
router.delete('/assignments/:id', isAdmin, staffController.removeAssignment);

export default router;
