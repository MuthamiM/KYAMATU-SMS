import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR')); // Restrict to admin roles

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/charts/students', dashboardController.getStudentCharts);
router.get('/charts/fees', dashboardController.getFeeCharts);
router.get('/charts/attendance', dashboardController.getAttendanceCharts);

export default router;
