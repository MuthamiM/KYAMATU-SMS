import prisma from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';

export const getOutline = async (classId, subjectId) => {
    // Find current term
    const currentTerm = await prisma.term.findFirst({
        where: { academicYear: { isCurrent: true } },
        orderBy: { startDate: 'desc' }, // Latest term
    });

    if (!currentTerm) throw new NotFoundError('Current Term');

    return prisma.courseOutline.findFirst({
        where: {
            classId: classId,
            subjectId: subjectId,
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
    });
};

export const upsertOutline = async (data, teacherId) => {
    const { classId, subjectId, content, title } = data;

    // Find current term
    const currentTerm = await prisma.term.findFirst({
        where: { academicYear: { isCurrent: true } },
        orderBy: { startDate: 'desc' },
    });

    if (!currentTerm) throw new NotFoundError('Current Term');

    // Check if outline exists
    const existing = await prisma.courseOutline.findUnique({
        where: {
            classId_subjectId_termId: {
                classId,
                subjectId,
                termId: currentTerm.id,
            },
        },
    });

    if (existing) {
        return prisma.courseOutline.update({
            where: { id: existing.id },
            data: {
                content,
                title,
                teacherId, // Update teacher if changed
            },
        });
    }

    return prisma.courseOutline.create({
        data: {
            classId,
            subjectId,
            termId: currentTerm.id,
            teacherId,
            content,
            title,
        },
    });
};
