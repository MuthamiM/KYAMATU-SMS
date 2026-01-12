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

async function main() {
  console.log('Starting seed...');
  await prisma.assessmentScore.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  // 1. Academic Year & Terms
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2026',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-11-30'),
      isCurrent: true,
    },
  });

  const term1 = await prisma.term.create({
    data: {
      name: 'Term 1',
      termNumber: 1,
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-04-10'),
      academicYearId: academicYear.id,
    },
  });

  // 2. Grades & Streams
  const gradesData = [
    { name: 'Grade 1', level: 3 },
    { name: 'Grade 2', level: 4 },
    { name: 'Grade 3', level: 5 },
    { name: 'Grade 4', level: 6 },
    { name: 'Grade 5', level: 7 },
    { name: 'Grade 6', level: 8 },
  ];

  const createdGrades = [];
  for (const g of gradesData) {
    createdGrades.push(await prisma.grade.create({ data: g }));
  }

  const streams = ['East', 'West'];
  const createdStreams = [];
  for (const name of streams) {
    createdStreams.push(await prisma.stream.create({ data: { name } }));
  }

  // 3. Classes and Subjects
  const createdClasses = [];
  const createdSubjects = [];

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
      createdSubjects.push(subject);
    }

    // Create classes for this grade (only East stream for most, West for Grade 4)
    const streamNames = grade.name === 'Grade 4' ? ['East', 'West'] : ['East'];
    
    for (const streamName of streamNames) {
      const stream = createdStreams.find(s => s.name === streamName);
      const cls = await prisma.class.create({
        data: {
          name: `${grade.name} ${streamName}`,
          capacity: 40,
          gradeId: grade.id,
          streamId: stream.id,
          academicYearId: academicYear.id,
        },
      });
      createdClasses.push(cls);

      // Link subjects to class
      for (const subj of gradeSubjects) {
        await prisma.classSubject.create({
          data: {
            classId: cls.id,
            subjectId: subj.id,
          }
        });
      }
    }
  }

  // 4. Assessments (Opener, Mid, End) for ALL subjects
  const assessments = [];
  for (const subject of createdSubjects) {
    const assessmentTypes = [
       { name: 'Opener Exam', maxScore: 30, weight: 0.3 },
       { name: 'Mid Term Exam', maxScore: 30, weight: 0.3 },
       { name: 'End Term Exam', maxScore: 40, weight: 0.4 },
    ];
    for (const type of assessmentTypes) {
      assessments.push(await prisma.assessment.create({
        data: {
          ...type,
          type: 'EXAM',
          termId: term1.id,
          subjectId: subject.id,
          date: new Date(),
        }
      }));
    }
  }

  // 5. Users (Admin, Teacher, Bursar)
  await prisma.user.create({
    data: { email: 'admin@kyamatu.ac.ke', password: hashedPassword, role: 'SUPER_ADMIN', phone: '+254700000001' },
  });

  await prisma.user.create({
    data: { email: 'bursar@kyamatu.ac.ke', password: hashedPassword, role: 'BURSAR', phone: '+254700000003' },
  });

  const teacherUser = await prisma.user.create({
    data: { email: 'teacher@kyamatu.ac.ke', password: hashedPassword, role: 'TEACHER', phone: '+254700000002' },
  });
  
  await prisma.staff.create({
     data: {
       userId: teacherUser.id,
       employeeNumber: 'TSC001',
       firstName: 'John',
       lastName: 'Doe',
       gender: 'Male',
       specialization: 'Mathematics'
     }
  });

  // 6. Students & Scores
  console.log('Creating students and scores...');
  let studentCounter = 1;
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

  for (const cls of createdClasses) {
    // 5 students per class
    for (let i = 0; i < 5; i++) {
        const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        const sUser = await prisma.user.create({
            data: { 
                email: `student${studentCounter}@kyamatu.ac.ke`, 
                password: hashedPassword, 
                role: 'STUDENT' 
            }
        });

        const student = await prisma.student.create({
            data: {
                userId: sUser.id,
                firstName: fName,
                lastName: lName,
                admissionNumber: `ADM${202600 + studentCounter}`,
                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                dateOfBirth: new Date('2015-01-01'),
                classId: cls.id,
                admissionStatus: 'APPROVED'
            }
        });

        // Add scores for this student for all assessments in their grade's subjects link to their class?
        // Wait, assessments are linked to subjects. 
        // We find subjects linked to this class.
        const classSubjects = await prisma.classSubject.findMany({
            where: { classId: cls.id },
            include: { subject: true }
        });

        for (const cs of classSubjects) {
            // Find assessments for this subject
            const subjectAssessments = assessments.filter(a => a.subjectId === cs.subjectId);
            
            for (const assess of subjectAssessments) {
                // Random score proportional to maxScore (between 40% and 95%)
                const percentage = 0.4 + (Math.random() * 0.55);
                const score = Math.round(assess.maxScore * percentage);
                
                await prisma.assessmentScore.create({
                    data: {
                        studentId: student.id,
                        assessmentId: assess.id,
                        score: score,
                        comment: score > (assess.maxScore * 0.8) ? 'Excellent' : 'Good effort'
                    }
                });
            }
        }

        // Add Attendance (20 days)
        for(let d=0; d<20; d++) {
             await prisma.attendance.create({
                 data: {
                     studentId: student.id,
                     classId: cls.id,
                     date: new Date(2026, 0, 6 + d), // Jan 6th onwards
                     status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT',
                     termId: term1.id
                 }
             });
        }
        
        studentCounter++;
    }
  }
  
  // 7. Fees & Payments
  console.log('Generating fees and payments...');
  
  // Create Fee Structures
  const feeStructures = [];
  // Grade 1-3
  for (const grade of createdGrades.filter(g => g.level <= 5)) {
    const fs = await prisma.feeStructure.create({
      data: {
        name: 'Term 1 Tuition & Activity',
        amount: 12000,
        gradeId: grade.id,
        termId: term1.id,
      }
    });
    feeStructures.push(fs);
  }
  // Grade 4-6
  for (const grade of createdGrades.filter(g => g.level >= 6)) {
    const fs = await prisma.feeStructure.create({
      data: {
        name: 'Term 1 Tuition & Activity',
        amount: 18000,
        gradeId: grade.id,
        termId: term1.id,
      }
    });
    feeStructures.push(fs);
  }
  
  // Create Invoices & Payments for Students
  const allStudents = await prisma.student.findMany({ include: { class: true } });
  
  for (const student of allStudents) {
    const studentGradeId = student.class.gradeId;
    const structure = feeStructures.find(fs => fs.gradeId === studentGradeId);
    
    if (structure) {
      // Create Invoice
      const invoice = await prisma.studentInvoice.create({
        data: {
          invoiceNo: `INV-${new Date().getFullYear()}-${student.admissionNumber}`,
          studentId: student.id,
          termId: term1.id,
          totalAmount: structure.amount,
          balance: structure.amount,
          dueDate: new Date('2026-02-06'),
          items: {
            create: {
              description: structure.name,
              amount: structure.amount,
              feeStructureId: structure.id
            }
          }
        }
      });
      
      // Randomly create payment (50% chance)
      if (Math.random() > 0.5) {
        const paymentAmount = Math.random() > 0.5 ? structure.amount : structure.amount / 2;
        await prisma.payment.create({
          data: {
            amount: paymentAmount,
            method: Math.random() > 0.5 ? 'MPESA' : 'BANK_TRANSFER',
            status: 'COMPLETED',
            transactionRef: `TX${Math.random().toString(36).substring(7).toUpperCase()}`,
            mpesaReceiptNo: `MP${Math.random().toString(36).substring(7).toUpperCase()}`,
            studentId: student.id,
            invoiceId: invoice.id,
            paidAt: new Date(),
          }
        });
        
        // Update Invoice Balance
        await prisma.studentInvoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: paymentAmount,
            balance: structure.amount - paymentAmount
          }
        });
      }
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
