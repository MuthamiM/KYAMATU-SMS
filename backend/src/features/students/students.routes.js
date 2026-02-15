import { Router } from 'express';
import * as studentsController from './students.controller.js';
import * as validators from './students.validator.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isStaff } from '../../middleware/rbac.js';
import { validateId } from '../../middleware/commonValidators.js';

const router = Router();

router.use(authenticate);

router.post('/', isAdmin, validators.createStudentValidator, validate, studentsController.createStudent);
router.get('/', academicController ? isStaff : studentsController.getStudents, validators.getStudentsValidator, validate, studentsController.getStudents);
router.get('/:id', validateId(), validate, studentsController.getStudent);
router.put('/:id', validateId(), isAdmin, validators.updateStudentValidator, validate, studentsController.updateStudent);
router.delete('/:id', validateId(), validate, isAdmin, studentsController.deleteStudent);

router.post('/:id/approve', validateId(), isAdmin, validators.admissionValidator, validate, studentsController.approveAdmission);
router.post('/:id/reject', validateId(), validate, isAdmin, studentsController.rejectAdmission);
router.post('/promote', isAdmin, validators.promoteValidator, validate, studentsController.promoteStudents);
router.post('/:id/guardians', validateId(), isAdmin, validators.guardianLinkValidator, validate, studentsController.linkGuardian);

export default router;

