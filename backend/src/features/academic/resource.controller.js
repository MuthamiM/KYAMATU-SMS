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

        const { classId, subjectId, title, type } = req.body;

        // Validate required fields
        if (!classId || !subjectId || !title || !type) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${[
                    !classId && 'classId',
                    !subjectId && 'subjectId',
                    !title && 'title',
                    !type && 'type'
                ].filter(Boolean).join(', ')}`
            });
        }

        // Handle uploaded file if present
        if (req.file) {
            req.body.url = `/public/uploads/resources/${req.file.filename}`;
            const kbSize = Math.round(req.file.size / 1024);
            req.body.size = kbSize > 1024 ? `${(kbSize / 1024).toFixed(1)} MB` : `${kbSize} KB`;
        } else if (!req.body.url) {
            throw new Error('Resource URL or File is required');
        }

        const resource = await resourceService.createResource(req.body, teacherId);
        sendCreated(res, resource, 'Course resource added successfully');
    } catch (error) {
        next(error);
    }
};
