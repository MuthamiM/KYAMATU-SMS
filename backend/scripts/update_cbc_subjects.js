import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CBC_SUBJECTS_CONFIG = {
  // Lower Primary (Grades 1 - 3)
  lowerPrimary: [
    { name: 'Literacy Activities', code: 'LIT' },
    { name: 'Kiswahili Language Activities', code: 'KIS' },
    { name: 'English Language Activities', code: 'ENG' },
    { name: 'Mathematical Activities', code: 'MAT' },
    { name: 'Environmental Activities', code: 'ENV' },
    { name: 'Hygiene and Nutrition Activities', code: 'HYG' },
    { name: 'Religious Education (CRE)', code: 'CRE' },
    { name: 'Movement and Creative Activities', code: 'MCA' },
  ],

  // Upper Primary (Grades 4 - 6)
  upperPrimary: [
    { name: 'English', code: 'ENG' },
    { name: 'Kiswahili', code: 'KIS' },
    { name: 'Mathematics', code: 'MAT' },
    { name: 'Science and Technology', code: 'SCI' },
    { name: 'Agriculture', code: 'AGR' },
    { name: 'Home Science', code: 'HOM' },
    { name: 'Social Studies', code: 'SST' },
    { name: 'Religious Education (CRE)', code: 'CRE' },
    { name: 'Creative Arts', code: 'ART' },
    { name: 'Physical and Health Education (PHE)', code: 'PHE' },
  ],

  // Junior Secondary (Grades 7 - 9)
  juniorSecondary: [
    { name: 'Mathematics', code: 'MAT' },
    { name: 'English', code: 'ENG' },
    { name: 'Kiswahili', code: 'KIS' },
    { name: 'Integrated Science', code: 'ISC' },
    { name: 'Agriculture and Nutrition', code: 'AGR' },
    { name: 'Pre-Technical Studies', code: 'PTS' },
    { name: 'Social Studies', code: 'SST' },
    { name: 'Religious Education (CRE)', code: 'CRE' },
    { name: 'Creative Arts and Sports', code: 'CAS' },
  ]
};

async function main() {
  console.log('Updating Matundu Primary School subjects to official Kenya CBC Structure (Grades 1-9)...');

  // Clean old subjects and class-subject links
  await prisma.timetableSlot.deleteMany();
  await prisma.courseResource.deleteMany();
  await prisma.courseOutline.deleteMany();
  await prisma.teacherAssignment.deleteMany();
  await prisma.assessmentScore.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.subject.deleteMany();

  const grades = await prisma.grade.findMany({
    include: { classes: true },
    orderBy: { level: 'asc' }
  });

  let totalSubjects = 0;

  for (const grade of grades) {
    let subjectList = [];
    if (grade.level <= 3) {
      subjectList = CBC_SUBJECTS_CONFIG.lowerPrimary;
    } else if (grade.level <= 6) {
      subjectList = CBC_SUBJECTS_CONFIG.upperPrimary;
    } else {
      subjectList = CBC_SUBJECTS_CONFIG.juniorSecondary;
    }

    const createdSubjects = [];
    for (const subj of subjectList) {
      const created = await prisma.subject.create({
        data: {
          name: subj.name,
          code: `${subj.code}${grade.level}`,
          gradeId: grade.id,
        }
      });
      createdSubjects.push(created);
      totalSubjects++;
    }

    // Link subjects to all classes in this grade
    for (const cls of grade.classes) {
      for (const subj of createdSubjects) {
        await prisma.classSubject.create({
          data: {
            classId: cls.id,
            subjectId: subj.id,
          }
        });
      }
    }

    console.log(`✓ ${grade.name} (Level ${grade.level}): ${createdSubjects.length} subjects configured.`);
  }

  console.log(`\nSuccessfully configured ${totalSubjects} official CBC subjects across Grades 1–9!`);
}

main()
  .catch(e => {
    console.error('Failed to update CBC subjects:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
