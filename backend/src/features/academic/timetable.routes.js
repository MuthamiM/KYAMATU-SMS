import express from 'express';
import * as timetableController from './timetable.controller.js';
import { authenticate as isAuth } from '../../middleware/auth.js';
import { isTeacher, isAdmin, isStaff, isStudent } from '../../middleware/rbac.js';

const router = express.Router();

router.get('/', isAuth, isStaff, timetableController.getTimetable);
router.get('/master', isAuth, isTeacher, timetableController.getMasterTimetable);
router.get('/teacher/:staffId', isAuth, isStaff, timetableController.getTeacherTimetable);
router.get('/my', isAuth, isTeacher, timetableController.getMyTimetable);
router.get('/next-lesson', isAuth, isTeacher, timetableController.getNextLesson);

router.post('/generate', isAuth, isAdmin, timetableController.generate);
router.post('/', isAuth, isAdmin, timetableController.upsertSlot); // Only Admin edits for now as per user req
router.delete('/:id', isAuth, isAdmin, timetableController.deleteSlot);

export default router;
