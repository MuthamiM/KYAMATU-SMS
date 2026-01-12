import { Router } from 'express';
import * as reportsController from './reports.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isTeacher, isStaff } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/generate', isTeacher, reportsController.generateReportCard);
router.post('/generate-class', isAdmin, reportsController.generateClassReports);
router.get('/', isStaff, reportsController.getReportCards);
router.put('/:id/comments', isTeacher, reportsController.updateComments);

router.get('/class/:classId/rankings', isStaff, reportsController.getClassRankings);
router.get('/class/:classId/subject/:subjectId/analysis', isStaff, reportsController.getSubjectAnalysis);

export default router;
