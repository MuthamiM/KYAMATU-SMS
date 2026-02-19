import { Router } from 'express';
import * as reportsController from './reports.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isTeacher, isStaff, isStudent } from '../../middleware/rbac.js';
import { validateId, validateClassId } from '../../middleware/commonValidators.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.post('/generate', reportsController.generateReportCard);
router.post('/generate-class', isAdmin, reportsController.generateClassReports);
router.get('/', isStudent, reportsController.getReportCards);
router.put('/:id/comments', validateId(), validate, isTeacher, reportsController.updateComments);

router.get('/class/:classId/rankings', validateClassId, validate, isStaff, reportsController.getClassRankings);
router.get('/class/:classId/subject/:subjectId/analysis', validateClassId, validate, isStaff, reportsController.getSubjectAnalysis);

export default router;

