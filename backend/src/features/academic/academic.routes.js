import { Router } from 'express';
import * as academicController from './academic.controller.js';
import outlineRoutes from './outline.routes.js';
import resourceRoutes from './resource.routes.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isStaff } from '../../middleware/rbac.js';

const router = Router();

router.get('/force-repair', academicController.forceRepair);

router.use(authenticate);

router.post('/years', isAdmin, academicController.createAcademicYear);
router.get('/years', isStaff, academicController.getAcademicYears);
router.get('/years/current', academicController.getCurrentYear);
router.put('/years/:id/current', isAdmin, academicController.setCurrentYear);

router.post('/terms', isAdmin, academicController.createTerm);
router.get('/terms', academicController.getTerms);

router.post('/grades', isAdmin, academicController.createGrade);
router.get('/grades', academicController.getGrades);

router.post('/streams', isAdmin, academicController.createStream);
router.get('/streams', academicController.getStreams);

router.post('/classes', isAdmin, academicController.createClass);
router.get('/classes', academicController.getClasses);
router.get('/classes/:id', academicController.getClass);
router.post('/classes/:classId/subjects', isAdmin, academicController.assignSubject);
router.delete('/classes/:classId/subjects/:subjectId', isAdmin, academicController.removeSubject);

router.post('/subjects', isAdmin, academicController.createSubject);
router.get('/subjects', academicController.getSubjects);

router.use('/outlines', outlineRoutes);
router.use('/resources', resourceRoutes);

export default router;
