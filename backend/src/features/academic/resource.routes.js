import express from 'express';
import * as resourceController from './resource.controller.js';
import { authenticate as isAuth } from '../../middleware/auth.js';
import { isTeacher, isStaff, isStudent } from '../../middleware/rbac.js';

const router = express.Router();

// Get resources (Students, Teachers, Admin)
router.get('/:classId/:subjectId', isAuth, resourceController.getResources);

// Create resource (Teachers only)
router.post('/', isAuth, isTeacher, resourceController.createResource);

export default router;
