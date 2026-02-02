import { Router } from 'express';
import * as assessmentsController from './assessments.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isTeacher, isStaff, isStudent } from '../../middleware/rbac.js';
import { restrictToOwnStudent } from '../../middleware/accessControl.js';
import { validateId, validateStudentId } from '../../middleware/commonValidators.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.post('/', isTeacher, assessmentsController.createAssessment);
router.get('/', isStaff, assessmentsController.getAssessments);
router.get('/:id', validateId(), validate, isStaff, assessmentsController.getAssessment);

router.post('/scores', isTeacher, assessmentsController.enterScore);
router.post('/scores/bulk', isTeacher, assessmentsController.enterBulkScores);
router.get('/student/:studentId/scores', validateStudentId, validate, isStudent, restrictToOwnStudent, assessmentsController.getStudentScores);
router.get('/student/:studentId/summary', validateStudentId, validate, isStudent, restrictToOwnStudent, assessmentsController.getStudentSummary);

router.post('/competencies', isAdmin, assessmentsController.createCompetency);
router.get('/competencies', isStaff, assessmentsController.getCompetencies);
router.post('/competencies/rate', isTeacher, assessmentsController.rateCompetency);
router.get('/student/:studentId/competencies', validateStudentId, validate, isStaff, assessmentsController.getStudentCompetencies);

export default router;

