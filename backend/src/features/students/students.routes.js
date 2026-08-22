import { Router } from 'express';
import * as studentsController from './students.controller.js';
import * as validators from './students.validator.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { isAdmin, isStaff } from '../../middleware/rbac.js';
import { validateId } from '../../middleware/commonValidators.js';
import { cacheRoute, invalidateCache } from '../../middleware/cache.js';

const router = Router();

router.use(authenticate);

router.post('/', isAdmin, invalidateCache(['students', 'dashboard']), validators.createStudentValidator, validate, studentsController.createStudent);
router.get('/', isStaff, validators.getStudentsValidator, validate, cacheRoute(60, 'students'), studentsController.getStudents);
router.get('/:id', validateId(), validate, cacheRoute(120, 'students'), studentsController.getStudent);
router.put('/:id', validateId(), isAdmin, invalidateCache(['students', 'dashboard']), validators.updateStudentValidator, validate, studentsController.updateStudent);
router.delete('/:id', validateId(), validate, isAdmin, invalidateCache(['students', 'dashboard']), studentsController.deleteStudent);

router.post('/:id/approve', validateId(), isAdmin, invalidateCache(['students', 'dashboard']), validators.admissionValidator, validate, studentsController.approveAdmission);
router.post('/:id/reject', validateId(), validate, isAdmin, invalidateCache(['students', 'dashboard']), studentsController.rejectAdmission);
router.post('/promote', isAdmin, invalidateCache(['students', 'dashboard', 'academic']), validators.promoteValidator, validate, studentsController.promoteStudents);
router.post('/:id/guardians', validateId(), isAdmin, invalidateCache(['students']), validators.guardianLinkValidator, validate, studentsController.linkGuardian);

export default router;

