import { Router } from 'express';
import * as attendanceController from './attendance.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isTeacher, isStaff } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/', isTeacher, attendanceController.markAttendance);
router.post('/bulk', isTeacher, attendanceController.markBulkAttendance);
router.get('/class/:classId', isTeacher, attendanceController.getClassAttendance);
router.get('/class/:classId/report', isStaff, attendanceController.getClassReport);
router.get('/student/:studentId', isStaff, attendanceController.getStudentAttendance);
router.get('/student/:studentId/stats', isStaff, attendanceController.getStudentStats);

export default router;
