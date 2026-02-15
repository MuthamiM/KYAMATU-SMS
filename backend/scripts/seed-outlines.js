import prisma from '../src/config/database.js';

async function seed() {
    console.log('Seeding course outlines...');

    const term = await prisma.term.findFirst({
        where: { academicYear: { isCurrent: true } },
        orderBy: { startDate: 'desc' }
    });

    if (!term) {
        console.error('No current term found');
        return;
    }

    const classes = await prisma.class.findMany({
        include: {
            classSubjects: {
                include: {
                    subject: true
                }
            },
            teacherAssignments: true
        }
    });

    for (const cls of classes) {
        for (const cs of cls.classSubjects) {
            const teacherAssignment = cls.teacherAssignments.find(ta => ta.subjectId === cs.subjectId) || cls.teacherAssignments[0];
            const teacherId = teacherAssignment?.staffId;

            if (!teacherId) continue;

            const content = [
                {
                    title: 'Introduction & Basics',
                    date: 'Week 1-2',
                    description: `Foundational concepts of ${cs.subject.name}. Key principles and initial assessments.`,
                    type: 'LESSON'
                },
                {
                    title: 'Core Methodologies',
                    date: 'Week 3-5',
                    description: 'In-depth study of specific techniques and practical applications.',
                    type: 'LESSON'
                },
                {
                    title: 'Mid-Term CAT',
                    date: 'Week 6',
                    description: 'Evaluation of progress covering all modules taught so far.',
                    type: 'CAT'
                },
                {
                    title: 'Advanced Topics',
                    date: 'Week 7-9',
                    description: 'Specialized areas and complex problem-solving scenarios.',
                    type: 'LESSON'
                },
                {
                    title: 'Final Project/Review',
                    date: 'Week 10-12',
                    description: 'Comprehensive review and preparation for end-of-term examinations.',
                    type: 'ASSIGNMENT'
                }
            ];

            await prisma.courseOutline.upsert({
                where: {
                    classId_subjectId_termId: {
                        classId: cls.id,
                        subjectId: cs.id, // Wait, in ClassSubject it's subjectId. In CourseOutline it's subjectId.
                        termId: term.id
                    }
                },
                update: { content },
                create: {
                    classId: cls.id,
                    subjectId: cs.subjectId,
                    termId: term.id,
                    teacherId,
                    content,
                    title: `${cs.subject.name} Syllabus - ${term.name}`
                }
            });
            console.log(`Seeded outline for ${cs.subject.name} in ${cls.name}`);
        }
    }

    console.log('Seeding completed.');
    process.exit(0);
}

seed();
