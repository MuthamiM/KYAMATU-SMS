import * as aiService from './ai.service.js';
import { sendSuccess } from '../../utils/response.js';
import { AuthorizationError } from '../../utils/errors.js';

export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const studentId = req.user.student?.id;

    if (!studentId) {
      throw new AuthorizationError('Only students can use the AI assistant for now');
    }

    const reply = await aiService.processChatMessage(req.user.id, studentId, message);
    sendSuccess(res, { reply });
  } catch (error) {
    next(error);
  }
};
