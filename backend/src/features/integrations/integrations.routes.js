import express from 'express';
import * as integrationsController from './integrations.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('STUDENT'));

router.get('/google/auth', integrationsController.getGoogleAuthUrl);
router.get('/google/callback', integrationsController.googleCallback);

router.get('/microsoft/auth', integrationsController.getMicrosoftAuthUrl);
router.get('/microsoft/callback', integrationsController.microsoftCallback);

router.get('/status', integrationsController.getIntegrationsStatus);

export default router;
