import * as timetableController from './src/features/academic/timetable.controller.js';
import { authenticate as isAuth } from './src/middleware/auth.js';
import { isTeacher, isAdmin, isStaff, isStudent } from './src/middleware/rbac.js';

console.log('isAuth:', typeof isAuth);
console.log('isTeacher:', typeof isTeacher);
console.log('getMasterTimetable:', typeof timetableController.getMasterTimetable);
console.log('getTimetable:', typeof timetableController.getTimetable);
console.log('getTeacherTimetable:', typeof timetableController.getTeacherTimetable);
console.log('getNextLesson:', typeof timetableController.getNextLesson);
