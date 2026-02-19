import { PrismaClient } from '@prisma/client';
import { generateTimetable } from '../src/features/academic/timetable.service.js';

const prisma = new PrismaClient();

async function repair() {
    console.log('--- Database Repair Starting ---');

    // 1. Timetable Repair
    const slotCount = await prisma.timetableSlot.count();
    if (slotCount === 0) {
        console.log('No timetable slots found. Generating...');
        await generateTimetable();
        console.log('Timetable slots generated successfully.');
    } else {
        console.log(`Found ${slotCount} timetable slots. Skipping generation.`);
    }

    // 2. Assessment Repair
    const assessmentCount = await prisma.assessment.count();
    const currentTerm = await prisma.term.findFirst({
        where: { academicYear: { isCurrent: true } },
        orderBy: { startDate: 'desc' }
    });

    if (assessmentCount === 0 && currentTerm) {
        console.log('No assessments found. Creating samples...');
        const subjects = await prisma.subject.findMany();

        for (const subj of subjects) {
            await prisma.assessment.create({
                data: {
                    name: 'Continuous Assessment 1',
                    type: 'CAT',
                    maxScore: 30,
                    weight: 0.3,
                    date: new Date(),
                    subjectId: subj.id,
                    termId: currentTerm.id
                }
            });
            await prisma.assessment.create({
                data: {
                    name: 'End Term Examination',
                    type: 'EXAM',
                    maxScore: 70,
                    weight: 0.7,
                    date: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000), // In 60 days
                    subjectId: subj.id,
                    termId: currentTerm.id
                }
            });
        }
        console.log(`Created sample assessments for ${subjects.length} subjects.`);
    } else {
        console.log(`Found ${assessmentCount} assessments. Skipping creation.`);
    }

    console.log('--- Repair Complete ---');
    await prisma.$disconnect();
}

repair().catch(e => {
    console.error('Repair failed:', e);
    process.exit(1);
});
