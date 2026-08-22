import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { cacheRoute } from '../../middleware/cache.js';

const router = Router();

router.use(authenticate);

// Admin/Bursar roles (cached for 60s)
router.get('/summary', requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR'), cacheRoute(60, 'dashboard'), dashboardController.getDashboardSummary);
router.get('/charts/students', requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR'), cacheRoute(120, 'dashboard'), dashboardController.getStudentCharts);
router.get('/charts/fees', requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR'), cacheRoute(120, 'dashboard'), dashboardController.getFeeCharts);
router.get('/charts/attendance', requireRole('SUPER_ADMIN', 'ADMIN', 'BURSAR'), cacheRoute(120, 'dashboard'), dashboardController.getAttendanceCharts);

// Current active term & year (cached for 300s)
router.get('/current-term', cacheRoute(300, 'academic'), dashboardController.getCurrentTerm);

// Student role (cached for 60s per student)
router.get('/student', requireRole('STUDENT'), cacheRoute(60, 'dashboard-student'), dashboardController.getStudentDashboard);

export default router;
