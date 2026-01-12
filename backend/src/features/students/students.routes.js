import { Router } from 'express';
import * as studentsController from './students.controller.js';
import * as validators from './students.validator.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isStaff } from '../../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.post('/', isAdmin, validators.createStudentValidator, validate, studentsController.createStudent);
router.get('/', isStaff, validators.getStudentsValidator, validate, studentsController.getStudents);
router.get('/:id', isStaff, studentsController.getStudent);
router.put('/:id', isAdmin, validators.updateStudentValidator, validate, studentsController.updateStudent);
router.delete('/:id', isAdmin, studentsController.deleteStudent);

router.post('/:id/approve', isAdmin, validators.admissionValidator, validate, studentsController.approveAdmission);
router.post('/:id/reject', isAdmin, studentsController.rejectAdmission);
router.post('/promote', isAdmin, validators.promoteValidator, validate, studentsController.promoteStudents);
router.post('/:id/guardians', isAdmin, validators.guardianLinkValidator, validate, studentsController.linkGuardian);

export default router;
