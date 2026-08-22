import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CBC_SUBJECTS_CONFIG = {
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
  console.log('Seeding Matundu Primary School database...');

  // Clean up everything
  await prisma.timetableSlot.deleteMany();
  await prisma.courseResource.deleteMany();
  await prisma.courseOutline.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.studentInvoice.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.assessmentScore.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.studentGuardian.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.teacherAssignment.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.user.deleteMany();

  const adminHashedPassword = await bcrypt.hash('Admin@123', 12);

  // 1. Create Academic Year 2026
  console.log('Creating academic year...');
  const currentYear = await prisma.academicYear.create({
    data: {
      name: '2026',
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-11-30'),
      isCurrent: true,
    }
  });

  // Create 3 terms for 2026
  const termDates = [
    { name: 'Term 1', num: 1, start: '2026-01-05', end: '2026-04-10' },
    { name: 'Term 2', num: 2, start: '2026-05-02', end: '2026-08-10' },
    { name: 'Term 3', num: 3, start: '2026-09-01', end: '2026-11-25' },
  ];

  for (const t of termDates) {
    await prisma.term.create({
      data: {
        name: t.name,
        termNumber: t.num,
        startDate: new Date(t.start),
        endDate: new Date(t.end),
        academicYearId: currentYear.id
      }
    });
  }

  // 2. Create Grades (Grade 1-9)
  console.log('Creating grades 1-9...');
  const createdGrades = [];
  for (let i = 1; i <= 9; i++) {
    const grade = await prisma.grade.create({
      data: { name: `Grade ${i}`, level: i }
    });
    createdGrades.push(grade);
  }

  // 3. Create Classes and Official CBC Subjects
  console.log('Creating classes and official CBC subjects...');
  for (const grade of createdGrades) {
    let subjectList = [];
    if (grade.level <= 3) {
      subjectList = CBC_SUBJECTS_CONFIG.lowerPrimary;
    } else if (grade.level <= 6) {
      subjectList = CBC_SUBJECTS_CONFIG.upperPrimary;
    } else {
      subjectList = CBC_SUBJECTS_CONFIG.juniorSecondary;
    }

    const gradeSubjects = [];
    for (const subj of subjectList) {
      const subject = await prisma.subject.create({
        data: {
          name: subj.name,
          code: `${subj.code}${grade.level}`,
          gradeId: grade.id,
        }
      });
      gradeSubjects.push(subject);
    }

    // Create one class per grade (no stream)
    const cls = await prisma.class.create({
      data: {
        name: `Grade ${grade.level}`,
        capacity: 40,
        gradeId: grade.id,
        academicYearId: currentYear.id,
      },
    });

    // Link subjects to class
    for (const subj of gradeSubjects) {
      await prisma.classSubject.create({
        data: { classId: cls.id, subjectId: subj.id }
      });
    }
  }

  // 4. Create Admin Account
  console.log('Creating admin account...');
  const adminUser = await prisma.user.create({
    data: { email: 'admin@matundu.ac.ke', password: adminHashedPassword, role: 'SUPER_ADMIN', phone: '+254700000000' },
  });
  await prisma.staff.create({
    data: {
      userId: adminUser.id,
      employeeNumber: 'ADM001',
      firstName: 'Admin',
      lastName: 'Matundu',
      gender: 'Male',
      qualification: 'System Administrator',
      specialization: 'Administration'
    }
  });

  // Summary
  const classCount = await prisma.class.count();
  const subjectCount = await prisma.subject.count();

  console.log('\nSeed completed successfully!');
  console.log('-------------------------------------------');
  console.log('Summary:');
  console.log(`   - Grades: 9 (Grade 1-9)`);
  console.log(`   - Classes: ${classCount}`);
  console.log(`   - Subjects: ${subjectCount}`);
  console.log(`   - Students: 0 (add your own)`);
  console.log(`   - Teachers: 0 (add your own)`);
  console.log('-------------------------------------------');
  console.log('\nLogin credentials:');
  console.log('   Admin: admin@matundu.ac.ke / Admin@123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
