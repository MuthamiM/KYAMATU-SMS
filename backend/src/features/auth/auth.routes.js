import { Router } from 'express';
import * as authController from './auth.controller.js';
import * as validators from './auth.validator.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/register', validators.registerValidator, validate, authController.register);
router.post('/login', validators.loginValidator, validate, authController.login);
router.post('/refresh', validators.refreshValidator, validate, authController.refresh);
router.post('/logout', validators.refreshValidator, validate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.post('/change-password', authenticate, validators.changePasswordValidator, validate, authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

export default router;
