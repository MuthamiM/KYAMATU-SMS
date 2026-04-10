import * as integrationsService from './integrations.service.js';
import { sendSuccess } from '../../utils/response.js';
import { AuthorizationError } from '../../utils/errors.js';
import prisma from '../../config/database.js';

export const getGoogleAuthUrl = async (req, res, next) => {
  try {
    const url = integrationsService.getGoogleAuthUrl();
    sendSuccess(res, { url });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    const studentId = req.user.student?.id;
    if (!studentId) throw new AuthorizationError('Student profile not found');

    await integrationsService.saveGoogleToken(studentId, code);
    await integrationsService.syncHistoricalReminders(studentId);
    
    // Redirect back to frontend dashboard
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard?status=google_connected`);
  } catch (error) {
    next(error);
  }
};

export const getMicrosoftAuthUrl = async (req, res, next) => {
  try {
    const url = integrationsService.getMicrosoftAuthUrl();
    sendSuccess(res, { url });
  } catch (error) {
    next(error);
  }
};

export const microsoftCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    const studentId = req.user.student?.id;
    if (!studentId) throw new AuthorizationError('Student profile not found');

    await integrationsService.saveMicrosoftToken(studentId, code);
    await integrationsService.syncHistoricalReminders(studentId);
    
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard?status=microsoft_connected`);
  } catch (error) {
    next(error);
  }
};

export const getIntegrationsStatus = async (req, res, next) => {
  try {
    const studentId = req.user.student?.id;
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { googleRefreshToken: true, microsoftRefreshToken: true }
    });

    sendSuccess(res, {
      google: !!student.googleRefreshToken,
      microsoft: !!student.microsoftRefreshToken
    });
  } catch (error) {
    next(error);
  }
};
