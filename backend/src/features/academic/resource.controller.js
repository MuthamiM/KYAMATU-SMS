import * as resourceService from './resource.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';

export const getResources = async (req, res, next) => {
    try {
        const { classId, subjectId } = req.params;
        const resources = await resourceService.getResources(classId, subjectId);
        sendSuccess(res, resources);
    } catch (error) {
        next(error);
    }
};

export const createResource = async (req, res, next) => {
    try {
        const teacherId = req.user.staff?.id;
        if (!teacherId) throw new Error('Teacher profile required');

        const resource = await resourceService.createResource(req.body, teacherId);
        sendCreated(res, resource, 'Course resource added successfully');
    } catch (error) {
        next(error);
    }
};
