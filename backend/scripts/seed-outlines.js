import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding course outlines...');

    const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const currentTerm = await prisma.term.findFirst({ where: { academicYearId: currentYear.id, termNumber: 1 } });

    const grade6 = await prisma.grade.findFirst({ where: { name: 'Grade 6' } });
    const classes = await prisma.class.findMany({ where: { gradeId: grade6.id, academicYearId: currentYear.id } });

    const subjects = await prisma.subject.findMany({ where: { gradeId: grade6.id } });

    for (const cls of classes) {
        const assignments = await prisma.teacherAssignment.findMany({
            where: { classId: cls.id },
            include: { subject: true, staff: true }
        });

        for (const assignment of assignments) {
            const outlineContent = [
                { title: 'Introduction to ' + assignment.subject.name, date: 'Week 1', description: 'Overview of the term syllabus and core concepts.', type: 'LESSON' },
                { title: 'Core Competencies', date: 'Week 2-3', description: 'Deep dive into key topics for this grade level.', type: 'LESSON' },
                { title: 'Mid-term CAT', date: 'Week 4', description: 'First continuous assessment test.', type: 'CAT' },
                { title: 'Practical Applications', date: 'Week 5-8', description: 'Hands-on projects and collaborative learning.', type: 'LESSON' },
                { title: 'Final Review', date: 'Week 9', description: 'Preparation for end of term examinations.', type: 'LESSON' }
            ];

            await prisma.courseOutline.upsert({
                where: {
                    classId_subjectId_termId: {
                        classId: cls.id,
                        subjectId: assignment.subjectId,
                        termId: currentTerm.id
                    }
                },
                update: {
                    content: outlineContent,
                    teacherId: assignment.staffId
                },
                create: {
                    classId: cls.id,
                    subjectId: assignment.subjectId,
                    termId: currentTerm.id,
                    teacherId: assignment.staffId,
                    content: outlineContent,
                    title: 'Term 1 Syllabus'
                }
            });
            console.log(`   - Seeded outline for ${assignment.subject.name} (Class: ${cls.name})`);
        }
    }

    console.log('Course outlines seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
