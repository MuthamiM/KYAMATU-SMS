import { Router } from 'express';
import * as academicController from './academic.controller.js';
import outlineRoutes from './outline.routes.js';
import resourceRoutes from './resource.routes.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isStaff } from '../../middleware/rbac.js';
import { cacheRoute, invalidateCache } from '../../middleware/cache.js';

const router = Router();

router.get('/force-repair', academicController.forceRepair);

router.use(authenticate);

router.post('/years', isAdmin, invalidateCache(['academic']), academicController.createAcademicYear);
router.get('/years', isStaff, cacheRoute(300, 'academic'), academicController.getAcademicYears);
router.get('/years/current', cacheRoute(300, 'academic'), academicController.getCurrentYear);
router.put('/years/:id/current', isAdmin, invalidateCache(['academic']), academicController.setCurrentYear);

router.post('/terms', isAdmin, invalidateCache(['academic']), academicController.createTerm);
router.get('/terms', cacheRoute(300, 'academic'), academicController.getTerms);

router.post('/grades', isAdmin, invalidateCache(['academic']), academicController.createGrade);
router.get('/grades', cacheRoute(300, 'academic'), academicController.getGrades);

router.post('/streams', isAdmin, invalidateCache(['academic']), academicController.createStream);
router.get('/streams', cacheRoute(300, 'academic'), academicController.getStreams);

router.post('/classes', isAdmin, invalidateCache(['academic']), academicController.createClass);
router.get('/classes', cacheRoute(180, 'academic'), academicController.getClasses);
router.get('/classes/:id', cacheRoute(180, 'academic'), academicController.getClass);
router.post('/classes/:classId/subjects', isAdmin, invalidateCache(['academic']), academicController.assignSubject);
router.delete('/classes/:classId/subjects/:subjectId', isAdmin, invalidateCache(['academic']), academicController.removeSubject);

router.post('/subjects', isAdmin, invalidateCache(['academic']), academicController.createSubject);
router.get('/subjects', cacheRoute(300, 'academic'), academicController.getSubjects);

router.use('/outlines', outlineRoutes);
router.use('/resources', resourceRoutes);

export default router;
