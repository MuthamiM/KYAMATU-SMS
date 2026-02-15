import * as outlineService from './outline.service.js';
import { sendSuccess } from '../../utils/response.js';

export const getOutline = async (req, res, next) => {
    try {
        const { classId, subjectId } = req.params;
        const outline = await outlineService.getOutline(classId, subjectId);
        sendSuccess(res, outline);
    } catch (error) {
        next(error);
    }
};

export const upsertOutline = async (req, res, next) => {
    try {
        const teacherId = req.user.staff?.id;
        if (!teacherId) throw new Error('Teacher profile required');

        const outline = await outlineService.upsertOutline(req.body, teacherId);
        sendSuccess(res, outline, 'Course outline saved successfully');
    } catch (error) {
        next(error);
    }
};
