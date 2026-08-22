import express from 'express';
import * as timetableController from './timetable.controller.js';
import { authenticate as isAuth } from '../../middleware/auth.js';
import { isTeacher, isAdmin, isStaff, isStudent } from '../../middleware/rbac.js';
import { cacheRoute, invalidateCache } from '../../middleware/cache.js';

const router = express.Router();

router.get('/', isAuth, cacheRoute(120, 'timetable'), timetableController.getTimetable);
router.get('/master', isAuth, isTeacher, cacheRoute(120, 'timetable'), timetableController.getMasterTimetable);
router.get('/teacher/:staffId', isAuth, isStaff, cacheRoute(120, 'timetable'), timetableController.getTeacherTimetable);
router.get('/my', isAuth, isTeacher, cacheRoute(120, 'timetable'), timetableController.getMyTimetable);
router.get('/next-lesson', isAuth, isTeacher, cacheRoute(60, 'timetable'), timetableController.getNextLesson);
router.get('/my-class', isAuth, isStudent, cacheRoute(120, 'timetable'), timetableController.getMyClassTimetable);

router.post('/generate', isAuth, isAdmin, invalidateCache(['timetable', 'dashboard']), timetableController.generate);
router.post('/', isAuth, isAdmin, invalidateCache(['timetable', 'dashboard']), timetableController.upsertSlot);
router.delete('/:id', isAuth, isAdmin, invalidateCache(['timetable', 'dashboard']), timetableController.deleteSlot);

export default router;
