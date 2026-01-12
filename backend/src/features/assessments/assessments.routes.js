import { Router } from 'express';
import * as assessmentsController from './assessments.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isTeacher, isStaff } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/', isTeacher, assessmentsController.createAssessment);
router.get('/', isStaff, assessmentsController.getAssessments);
router.get('/:id', isStaff, assessmentsController.getAssessment);

router.post('/scores', isTeacher, assessmentsController.enterScore);
router.post('/scores/bulk', isTeacher, assessmentsController.enterBulkScores);
router.get('/student/:studentId/scores', isStaff, assessmentsController.getStudentScores);
router.get('/student/:studentId/summary', isStaff, assessmentsController.getStudentSummary);

router.post('/competencies', isAdmin, assessmentsController.createCompetency);
router.get('/competencies', isStaff, assessmentsController.getCompetencies);
router.post('/competencies/rate', isTeacher, assessmentsController.rateCompetency);
router.get('/student/:studentId/competencies', isStaff, assessmentsController.getStudentCompetencies);

export default router;
