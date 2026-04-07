import prisma from '../../config/database.js';
import { NotFoundError, AuthorizationError } from '../../utils/errors.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const getResources = async (classId, subjectId) => {
    // Find current term
    const currentTerm = await prisma.term.findFirst({
        where: { academicYear: { isCurrent: true } },
        orderBy: { startDate: 'desc' },
    });

    if (!currentTerm) throw new NotFoundError('Current Term');

    return prisma.courseResource.findMany({
        where: {
            classId,
            subjectId,
            termId: currentTerm.id,
        },
        include: {
            teacher: {
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const createResource = async (data, teacherId) => {
    const { classId, subjectId, title, type, url, size } = data;

    // Find current term
    const currentTerm = await prisma.term.findFirst({
        where: { academicYear: { isCurrent: true } },
        orderBy: { startDate: 'desc' },
    });

    if (!currentTerm) throw new NotFoundError('Current Term');

    return prisma.courseResource.create({
        data: {
            classId,
            subjectId,
            teacherId,
            termId: currentTerm.id,
            title,
            type,
            url,
            size,
        },
    });
};

export const deleteResource = async (resourceId, user) => {

    const resource = await prisma.courseResource.findUnique({
        where: { id: resourceId }
    });

    if (!resource) {
        throw new NotFoundError('Resource');
    }

    // Role check: Only the teacher who created it, or an admin can delete it
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        if (!user.staff || user.staff.id !== resource.teacherId) {
            throw new AuthorizationError('You can only delete your own resources');
        }
    }

    // Attempt to delete physical file if it exists
    if (resource.url && resource.url.startsWith('/public/')) {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const filePath = path.join(__dirname, '../../../../', resource.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.error('Failed to delete physical file:', err);
        }
    }

    return prisma.courseResource.delete({
        where: { id: resourceId }
    });
};
