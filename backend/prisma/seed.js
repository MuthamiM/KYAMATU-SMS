import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUBJECTS_LIST = [
  { name: 'Mathematics', code: 'MAT' },
  { name: 'English', code: 'ENG' },
  { name: 'Kiswahili', code: 'KIS' },
  { name: 'Science and Technology', code: 'SCI' },
  { name: 'Social Studies', code: 'SST' },
  { name: 'CRE', code: 'CRE' },
  { name: 'Creative Arts', code: 'ART' },
  { name: 'PHE', code: 'PHE' },
  { name: 'Agriculture', code: 'AGR' },
  { name: 'Home Science', code: 'HOM' }
];

// Kenyan first names
const FIRST_NAMES_MALE = ['James', 'John', 'Peter', 'David', 'Michael', 'Brian', 'Kevin', 'Dennis', 'Collins', 'Victor', 'Samuel', 'Joseph', 'Daniel', 'Stephen', 'Patrick'];
const FIRST_NAMES_FEMALE = ['Mary', 'Grace', 'Faith', 'Joy', 'Mercy', 'Alice', 'Sarah', 'Rose', 'Esther', 'Nancy', 'Lucy', 'Catherine', 'Jane', 'Ann', 'Elizabeth'];
const LAST_NAMES = ['Mwangi', 'Otieno', 'Kamau', 'Wanjiku', 'Ochieng', 'Njoroge', 'Kipchoge', 'Wambui', 'Kimani', 'Mutua', 'Omondi', 'Karanja', 'Kiprotich', 'Akinyi', 'Ndungu'];

async function main() {
  console.log('🚀 Starting fresh seed with 10 students per class...');
  
  // Clean up everything
  await prisma.timetableSlot.deleteMany();
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

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  // 1. Create Academic Year 2026
  console.log('📅 Creating academic year...');
  const currentYear = await prisma.academicYear.create({
    data: {
      name: '2026',
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-11-30'),
      isCurrent: true,
    }
  });

  // Create 3 terms for 2026
  const terms = [];
  const termDates = [
    { name: 'Term 1', num: 1, start: '2026-01-05', end: '2026-04-10' },
    { name: 'Term 2', num: 2, start: '2026-05-02', end: '2026-08-10' },
    { name: 'Term 3', num: 3, start: '2026-09-01', end: '2026-11-25' },
  ];
  
  for (const t of termDates) {
    const term = await prisma.term.create({
      data: {
        name: t.name,
        termNumber: t.num,
        startDate: new Date(t.start),
        endDate: new Date(t.end),
        academicYearId: currentYear.id
      }
    });
    terms.push(term);
  }
  const currentTerm = terms[0]; // Term 1

  // 2. Create Grades (Grade 1-6)
  console.log('📚 Creating grades...');
  const gradesData = [
    { name: 'Grade 1', level: 1 },
    { name: 'Grade 2', level: 2 },
    { name: 'Grade 3', level: 3 },
    { name: 'Grade 4', level: 4 },
    { name: 'Grade 5', level: 5 },
    { name: 'Grade 6', level: 6 },
  ];

  const createdGrades = [];
  for (const g of gradesData) {
    const grade = await prisma.grade.create({ data: g });
    createdGrades.push(grade);
  }

  // 3. Create Streams
  console.log('🏫 Creating streams...');
  const streamEast = await prisma.stream.create({ data: { name: 'East' } });
  const streamWest = await prisma.stream.create({ data: { name: 'West' } });

  // 4. Create Classes (One stream per grade, except Grade 4 has two)
  console.log('🏫 Creating classes...');
  const createdClasses = [];
  
  for (const grade of createdGrades) {
    // Create subjects for this grade
    const gradeSubjects = [];
    for (const subj of SUBJECTS_LIST) {
      const subject = await prisma.subject.create({
        data: {
          name: subj.name,
          code: `${subj.code}${grade.level}`,
          gradeId: grade.id,
        }
      });
      gradeSubjects.push(subject);
    }

    // Determine streams for this grade
    const streamsForGrade = grade.name === 'Grade 4' 
      ? [streamEast, streamWest] 
      : [streamEast];

    for (const stream of streamsForGrade) {
      const cls = await prisma.class.create({
        data: {
          name: `${grade.name} ${stream.name}`,
          capacity: 40,
          gradeId: grade.id,
          streamId: stream.id,
          academicYearId: currentYear.id,
        },
      });
      createdClasses.push({ ...cls, grade, subjects: gradeSubjects });

      // Link subjects to class
      for (const subj of gradeSubjects) {
        await prisma.classSubject.create({
          data: { classId: cls.id, subjectId: subj.id }
        });
      }
    }
  }

  console.log(`✅ Created ${createdClasses.length} classes`);

  // 5. Create Admin Users
  console.log('👤 Creating admin users...');
  await prisma.user.create({
    data: { email: 'admin@kyamatu.ac.ke', password: hashedPassword, role: 'SUPER_ADMIN', phone: '+254700000001' },
  });
  await prisma.user.create({
    data: { email: 'bursar@kyamatu.ac.ke', password: hashedPassword, role: 'BURSAR', phone: '+254700000003' },
  });
  
  // Create Multiple Teachers
  console.log('👨‍🏫 Creating teaching staff...');
  const teacherData = [
    { email: 'teacher@kyamatu.ac.ke', empNo: 'TSC001', first: 'John', last: 'Musa', gender: 'Male', spec: 'Mathematics' },
    { email: 'mmwende@kyamatu.ac.ke', empNo: 'TSC002', first: 'Mary', last: 'Mwende', gender: 'Female', spec: 'English' },
    { email: 'pkimani@kyamatu.ac.ke', empNo: 'TSC003', first: 'Peter', last: 'Kimani', gender: 'Male', spec: 'Science and Technology' },
    { email: 'gwanjiku@kyamatu.ac.ke', empNo: 'TSC004', first: 'Grace', last: 'Wanjiku', gender: 'Female', spec: 'Kiswahili' },
    { email: 'dotieno@kyamatu.ac.ke', empNo: 'TSC005', first: 'David', last: 'Otieno', gender: 'Male', spec: 'Social Studies' },
    { email: 'fnzuki@kyamatu.ac.ke', empNo: 'TSC006', first: 'Faith', last: 'Nzuki', gender: 'Female', spec: 'CRE' },
  ];

  for (const t of teacherData) {
    const teacherUser = await prisma.user.create({
      data: { email: t.email, password: hashedPassword, role: 'TEACHER', phone: `+2547${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}` },
    });
    await prisma.staff.create({
      data: { 
        userId: teacherUser.id, 
        employeeNumber: t.empNo, 
        firstName: t.first, 
        lastName: t.last, 
        gender: t.gender, 
        specialization: t.spec 
      }
    });
  }
  console.log(`✅ Created ${teacherData.length} teachers`);

  // 6. Create 10 Students per Class
  console.log('👨‍🎓 Creating 10 students per class...');
  let studentCounter = 1;
  const allStudents = [];

  for (const cls of createdClasses) {
    console.log(`   Adding 10 students to ${cls.name}...`);
    
    for (let i = 0; i < 10; i++) {
      const isMale = Math.random() > 0.5;
      const firstName = isMale 
        ? FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)]
        : FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      
      // Random admission date in Jan 2026
      const admitDay = Math.floor(Math.random() * 10) + 5;
      const admitDate = new Date(2026, 0, admitDay);

      const studentUser = await prisma.user.create({
        data: { 
          email: `student${studentCounter}@kyamatu.ac.ke`, 
          password: hashedPassword, 
          role: 'STUDENT',
        }
      });

      // Calculate birth year based on grade (roughly age 6-12)
      const birthYear = 2026 - (cls.grade.level + 5);
      
      const student = await prisma.student.create({
        data: {
          userId: studentUser.id,
          firstName: firstName,
          lastName: lastName,
          admissionNumber: `ADM2026${studentCounter.toString().padStart(3, '0')}`,
          gender: isMale ? 'Male' : 'Female',
          dateOfBirth: new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          classId: cls.id,
          admissionStatus: 'APPROVED',
          admissionDate: admitDate
        }
      });
      
      allStudents.push(student);
      studentCounter++;
    }
  }

  console.log(`✅ Created ${allStudents.length} students total`);

  // 7. Create Fee Structure and Invoices
  console.log('💰 Creating fee structures and invoices...');
  
  // Fee structure for all grades
  for (const grade of createdGrades) {
    await prisma.feeStructure.create({
      data: { 
        name: 'Tuition Fee', 
        amount: 15000, 
        gradeId: grade.id, 
        termId: currentTerm.id 
      }
    });
  }

  // Create invoices and some payments for students
  for (const student of allStudents) {
    const invoice = await prisma.studentInvoice.create({
      data: {
        invoiceNo: `INV${student.admissionNumber}`,
        studentId: student.id,
        termId: currentTerm.id,
        totalAmount: 15000,
        balance: 15000,
        dueDate: new Date('2026-02-01')
      }
    });

    // 70% of students have made some payment
    if (Math.random() > 0.3) {
      const paymentAmount = Math.floor(Math.random() * 12000) + 3000; // 3000-15000
      await prisma.payment.create({
        data: {
          amount: paymentAmount,
          method: Math.random() > 0.5 ? 'MPESA' : 'BANK_TRANSFER',
          status: 'COMPLETED',
          transactionRef: `TX${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          studentId: student.id,
          invoiceId: invoice.id,
          paidAt: new Date(2026, 0, Math.floor(Math.random() * 14) + 1)
        }
      });
      
      await prisma.studentInvoice.update({
        where: { id: invoice.id },
        data: { 
          paidAmount: paymentAmount, 
          balance: Math.max(0, 15000 - paymentAmount) 
        }
      });
    }
  }

  // 8. Create Attendance Records (Today)
  console.log('📋 Creating attendance records...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const student of allStudents) {
    // 94% present, 4% absent, 2% late
    const rand = Math.random();
    let status = 'PRESENT';
    if (rand > 0.96) status = 'LATE';
    else if (rand > 0.94) status = 'ABSENT';

    await prisma.attendance.create({
      data: {
        date: today,
        studentId: student.id,
        classId: student.classId,
        status: status,
        termId: currentTerm.id
      }
    });
  }

  // 9. Summary
  const classCount = await prisma.class.count();
  const studentCount = await prisma.student.count();
  const staffCount = await prisma.staff.count();

  console.log('\n🎉 Seed completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Summary:`);
  console.log(`   • Classes: ${classCount}`);
  console.log(`   • Students: ${studentCount} (10 per class)`);
  console.log(`   • Staff: ${staffCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📧 Login credentials:');
  console.log('   Admin: admin@kyamatu.ac.ke / Admin@123');
  console.log('   Bursar: bursar@kyamatu.ac.ke / Admin@123');
  console.log('   Teacher: teacher@kyamatu.ac.ke / Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
