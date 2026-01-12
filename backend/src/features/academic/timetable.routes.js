import express from 'express';
import * as timetableController from './timetable.controller.js';
import { authenticate as isAuth } from '../../middleware/auth.js';
import { isTeacher, isAdmin } from '../../middleware/rbac.js';

const router = express.Router();

router.get('/', isAuth, timetableController.getTimetable);
router.get('/my', isAuth, isTeacher, timetableController.getTeacherTimetable);
router.post('/generate', isAuth, isAdmin, timetableController.generate);
router.post('/', isAuth, isAdmin, timetableController.upsertSlot); // Only Admin edits for now as per user req
router.delete('/:id', isAuth, isAdmin, timetableController.deleteSlot);

export default router;
