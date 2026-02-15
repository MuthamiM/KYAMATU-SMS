import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Admin/Bursar roles
router.get('/summary', requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR'), dashboardController.getDashboardSummary);
router.get('/charts/students', requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR'), dashboardController.getStudentCharts);
router.get('/charts/fees', requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR'), dashboardController.getFeeCharts);
router.get('/charts/attendance', requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR'), dashboardController.getAttendanceCharts);

// Student role
router.get('/student', requireRole('STUDENT'), dashboardController.getStudentDashboard);

export default router;
