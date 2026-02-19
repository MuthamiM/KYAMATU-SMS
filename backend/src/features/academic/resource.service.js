import prisma from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';

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
