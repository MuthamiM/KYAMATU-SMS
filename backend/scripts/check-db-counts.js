import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const classCount = await prisma.class.count();
        const subjectCount = await prisma.subject.count();
        const staffCount = await prisma.staff.count();
        const teacherCount = await prisma.staff.count({ where: { user: { role: 'TEACHER' } } });
        const assignmentCount = await prisma.teacherAssignment.count();
        const classSubjectCount = await prisma.classSubject.count();

        console.log('Database Counts:');
        console.log(`Classes: ${classCount}`);
        console.log(`Subjects: ${subjectCount}`);
        console.log(`Staff: ${staffCount} (Teachers: ${teacherCount})`);
        console.log(`ClassSubjects: ${classSubjectCount}`);
        console.log(`TeacherAssignments: ${assignmentCount}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
