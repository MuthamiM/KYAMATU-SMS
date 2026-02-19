import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('--- Checking DB for Grade 6 East & Kiswahili ---');

        const term = await prisma.term.findFirst({
            where: { academicYear: { isCurrent: true } },
            orderBy: { startDate: 'desc' },
        });
        console.log('Current Term ID:', term?.id);

        const subjects = await prisma.subject.findMany();
        console.log('All Subjects:', subjects.map(s => `${s.id}: ${s.name}`).join(', '));

        const assignments = await prisma.teacherAssignment.findMany({
            include: { subject: true, staff: true, class: true }
        });
        console.log('All Assignments Count:', assignments.length);

        const g6East = await prisma.class.findFirst({ where: { name: { contains: 'Grade 6' } } });
        console.log('G6 East Class ID:', g6East?.id);

        if (g6East) {
            const classAssignments = assignments.filter(a => a.classId === g6East.id);
            console.log(`Assignments for ${g6East.name}:`, classAssignments.map(a => `${a.subject.name} -> ${a.staff.firstName}`).join(', '));

            const outlines = await prisma.courseOutline.findMany({
                where: { classId: g6East.id, termId: term?.id },
                include: { subject: true }
            });
            console.log(`Outlines for ${g6East.name}:`, outlines.map(o => o.subject.name).join(', '));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
