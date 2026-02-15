import express from 'express';
import * as outlineController from './outline.controller.js';
import { authenticate as isAuth } from '../../middleware/auth.js';
import { isTeacher, isStaff, isStudent } from '../../middleware/rbac.js';

const router = express.Router();

// Get outline (Students, Teachers, Admin)
router.get('/:classId/:subjectId', isAuth, outlineController.getOutline);

// Create/Update outline (Teachers only)
router.post('/', isAuth, isTeacher, outlineController.upsertOutline);

export default router;
