import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const subjectResourceMap = {
    'Mathematics': { url: 'https://www.khanacademy.org/math', title: 'Khan Academy Mathematics', type: 'LINK' },
    'English': { url: 'https://learnenglish.britishcouncil.org/', title: 'British Council English Learning', type: 'LINK' },
    'Kiswahili': { url: 'https://www.bbc.com/swahili', title: 'BBC Kiswahili Resources', type: 'LINK' },
    'Science and Technology': { url: 'https://www.khanacademy.org/science', title: 'Khan Academy Science', type: 'LINK' },
    'Social Studies': { url: 'https://www.nationalgeographic.org/education/resource-library/', title: 'National Geographic Social Studies', type: 'LINK' },
    'CRE': { url: 'https://www.bible.com/', title: 'Bible Study Resources', type: 'LINK' },
    'Creative Arts': { url: 'https://www.tate.org.uk/learn', title: 'Tate Art Learning', type: 'LINK' },
    'PHE': { url: 'https://www.topendsports.com/resources/', title: 'Physical Education Resources', type: 'LINK' },
    'Agriculture': { url: 'https://www.fao.org/home/en/', title: 'FAO Agriculture Resources', type: 'LINK' },
    'Home Science': { url: 'https://extension.umn.edu/family-and-consumer-science', title: 'Home Science Resources', type: 'LINK' },
};

async function main() {
    console.log('🔧 Starting outline & resource repair...\n');

    const terms = await prisma.term.findMany({
        where: { academicYear: { isCurrent: true } },
        orderBy: { termNumber: 'asc' }
    });

    if (terms.length === 0) {
        console.error('❌ No current academic year / terms found!');
        return;
    }
    console.log(`✅ Found ${terms.length} term(s): ${terms.map(t => t.name).join(', ')}`);

    const classes = await prisma.class.findMany({
        include: { classTeacher: { select: { id: true } } }
    });
    const subjects = await prisma.subject.findMany();
    const anyStaff = await prisma.staff.findFirst();

    console.log(`✅ ${classes.length} classes, ${subjects.length} subjects\n`);

    let outlinesCreated = 0;
    let outlinesSkipped = 0;
    let resourcesCreated = 0;
    let resourcesFixed = 0;
    let resourcesSkipped = 0;

    for (const term of terms) {
        for (const cls of classes) {
            for (const subj of subjects) {
                const assignment = await prisma.teacherAssignment.findFirst({
                    where: { classId: cls.id, subjectId: subj.id }
                });
                const teacherId = assignment?.staffId || cls.classTeacher?.id || anyStaff?.id;
                if (!teacherId) continue;

                // 1. Outline
                const existingOutline = await prisma.courseOutline.findUnique({
                    where: { classId_subjectId_termId: { classId: cls.id, subjectId: subj.id, termId: term.id } }
                });

                if (!existingOutline) {
                    await prisma.courseOutline.create({
                        data: {
                            classId: cls.id,
                            subjectId: subj.id,
                            termId: term.id,
                            teacherId,
                            title: `${subj.name} - ${term.name} Outline`,
                            content: [
                                { title: 'Introduction', description: `${subj.name} — core goals, objectives and term overview.`, type: 'LESSON', date: 'Week 1' },
                                { title: 'Core Modules', description: 'Exploring fundamental principles and practical applications of key concepts.', type: 'LESSON', date: 'Weeks 2-5' },
                                { title: 'Continuous Assessment (CAT)', description: 'Formal CAT evaluating term progress and understanding so far.', type: 'CAT', date: 'Week 6' },
                                { title: 'Advanced Topics', description: 'Building on foundations with specialized techniques and real-world applications.', type: 'LESSON', date: 'Weeks 7-9' },
                                { title: 'Group Assignments', description: 'Individual and group assignment submissions and presentations.', type: 'ASSIGNMENT', date: 'Week 9' },
                                { title: 'Final Revision & Exam Prep', description: 'Comprehensive review and preparation for end-of-term examinations.', type: 'LESSON', date: 'Week 10' }
                            ]
                        }
                    });
                    outlinesCreated++;
                } else {
                    outlinesSkipped++;
                }

                // 2. Resources
                const existingResource = await prisma.courseResource.findFirst({
                    where: { classId: cls.id, subjectId: subj.id, termId: term.id }
                });

                const baseName = Object.keys(subjectResourceMap).find(k => subj.name.startsWith(k)) || null;
                const resourceInfo = baseName ? subjectResourceMap[baseName] : {
                    url: 'https://www.open.edu/openlearn/',
                    title: `${subj.name} Study Materials`,
                    type: 'LINK'
                };

                if (!existingResource) {
                    await prisma.courseResource.create({
                        data: {
                            classId: cls.id, subjectId: subj.id, termId: term.id, teacherId,
                            title: resourceInfo.title, type: resourceInfo.type, url: resourceInfo.url, size: null
                        }
                    });
                    resourcesCreated++;
                } else if (existingResource.url === 'https://example.com/sample-resource.pdf') {
                    await prisma.courseResource.update({
                        where: { id: existingResource.id },
                        data: { url: resourceInfo.url, title: resourceInfo.title, type: resourceInfo.type, size: null }
                    });
                    resourcesFixed++;
                } else {
                    resourcesSkipped++;
                }
            }
        }
    }

    console.log('📊 Results:');
    console.log(`   Outlines created:   ${outlinesCreated}`);
    console.log(`   Outlines skipped:   ${outlinesSkipped} (already existed)`);
    console.log(`   Resources created:  ${resourcesCreated}`);
    console.log(`   Resources fixed:    ${resourcesFixed} (placeholder URLs replaced)`);
    console.log(`   Resources skipped:  ${resourcesSkipped} (already had real URLs)`);
    console.log('\n✅ Done!');
}

main().catch(e => console.error('❌', e)).finally(() => prisma.$disconnect());
