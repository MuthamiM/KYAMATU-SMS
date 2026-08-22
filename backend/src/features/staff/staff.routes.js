import { Router } from 'express';
import * as staffController from './staff.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isTeacher } from '../../middleware/rbac.js';
import { cacheRoute, invalidateCache } from '../../middleware/cache.js';

const router = Router();

router.use(authenticate);

router.post('/', isAdmin, invalidateCache(['staff', 'dashboard']), staffController.createStaff);
router.get('/', isAdmin, cacheRoute(120, 'staff'), staffController.getStaff);
router.get('/my-classes', isTeacher, cacheRoute(60, 'staff-classes'), staffController.getMyClasses);
router.get('/:id', isAdmin, cacheRoute(120, 'staff'), staffController.getStaffMember);
router.put('/:id', isAdmin, invalidateCache(['staff', 'dashboard']), staffController.updateStaff);
router.delete('/:id', isAdmin, invalidateCache(['staff', 'dashboard']), staffController.deleteStaff);

router.post('/assignments', isAdmin, invalidateCache(['staff', 'academic', 'timetable']), staffController.assignTeacher);
router.delete('/assignments/:id', isAdmin, invalidateCache(['staff', 'academic', 'timetable']), staffController.removeAssignment);

export default router;
