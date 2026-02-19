import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const currentTerm = await prisma.term.findFirst({
        where: { academicYear: { isCurrent: true } },
        orderBy: { startDate: 'desc' },
    });

    console.log('Current Term:', currentTerm?.name, 'ID:', currentTerm?.id);

    if (!currentTerm) {
        console.log('No current term found!');
        return;
    }

    const outlines = await prisma.courseOutline.findMany({
        where: { termId: currentTerm.id },
        include: {
            class: { select: { name: true } },
            subject: { select: { name: true } }
        }
    });

    console.log(`Found ${outlines.length} outlines for current term.`);

    if (outlines.length > 0) {
        console.log('Sample outlines:');
        outlines.slice(0, 10).forEach(o => {
            console.log(`- Class: ${o.class.name} (${o.classId}), Subject: ${o.subject.name} (${o.subjectId}), Title: ${o.title}`);
        });
    }

    // Check specifically for a common class/subject
    const sampleStudent = await prisma.student.findFirst({
        include: { class: true }
    });

    if (sampleStudent) {
        console.log(`Sample Student: ${sampleStudent.firstName} ${sampleStudent.lastName}, Class: ${sampleStudent.class.name} (${sampleStudent.classId})`);

        const studentOutlines = await prisma.courseOutline.findMany({
            where: {
                classId: sampleStudent.classId,
                termId: currentTerm.id
            },
            include: { subject: { select: { name: true } } }
        });

        console.log(`Outlines for this class: ${studentOutlines.length}`);
        studentOutlines.forEach(o => {
            console.log(`  - ${o.subject.name}: ${o.title}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
