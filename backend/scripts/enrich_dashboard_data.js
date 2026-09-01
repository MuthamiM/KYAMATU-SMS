import { PrismaClient, PaymentMethod, PaymentStatus, AttendanceStatus } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function enrich() {
  console.log('--- Starting Fast Data Enrichment for Matundu Primary SMS Dashboard ---');

  // Clean any partially created invoices and payments
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.studentInvoice.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.announcement.deleteMany();

  // 1. Fetch academic year, terms, grades, students
  const academicYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
    include: { terms: { orderBy: { termNumber: 'asc' } } }
  });

  if (!academicYear || academicYear.terms.length === 0) {
    console.log('No academic year or terms found.');
    return;
  }

  const terms = academicYear.terms;
  const grades = await prisma.grade.findMany({ orderBy: { level: 'asc' } });
  const students = await prisma.student.findMany({
    include: { class: true }
  });

  console.log(`Loaded ${grades.length} grades and ${students.length} students.`);

  // 2. Ensure Fee Structures exist
  let feeStructures = await prisma.feeStructure.findMany();
  if (feeStructures.length === 0) {
    console.log('Creating Fee Structures...');
    const feeData = [];
    for (const grade of grades) {
      const baseFee = grade.level <= 3 ? 4500 : grade.level <= 6 ? 5500 : 7500;
      for (const term of terms) {
        feeData.push({
          id: crypto.randomUUID(),
          name: `${grade.name} - ${term.name} Fee Structure`,
          amount: baseFee,
          gradeId: grade.id,
          termId: term.id,
        });
      }
    }
    await prisma.feeStructure.createMany({ data: feeData });
    feeStructures = await prisma.feeStructure.findMany();
  }

  // 3. Fast Bulk Invoice & Payment generation
  console.log('Generating bulk invoices and payments...');
  const invoiceRecords = [];
  const paymentRecords = [];
  const paymentMethods = [PaymentMethod.MPESA, PaymentMethod.BANK_TRANSFER, PaymentMethod.CASH];

  let counter = 1000;
  for (const student of students) {
    if (!student.class?.gradeId) continue;
    const gradeId = student.class.gradeId;

    for (const term of terms) {
      counter++;
      const feeStruct = feeStructures.find(f => f.gradeId === gradeId && f.termId === term.id);
      const totalAmount = feeStruct ? feeStruct.amount : 5000;

      let paidAmount = 0;
      if (term.termNumber === 1) {
        const r = Math.random();
        paidAmount = r < 0.85 ? totalAmount : (r < 0.95 ? Math.floor(totalAmount * 0.6) : 0);
      } else if (term.termNumber === 2) {
        const r = Math.random();
        paidAmount = r < 0.75 ? totalAmount : (r < 0.90 ? Math.floor(totalAmount * 0.5) : 0);
      } else {
        const r = Math.random();
        paidAmount = r < 0.40 ? totalAmount : (r < 0.70 ? Math.floor(totalAmount * 0.4) : 0);
      }

      const balance = Math.max(0, totalAmount - paidAmount);
      const invoiceId = crypto.randomUUID();
      const dueDate = new Date(term.startDate);
      dueDate.setDate(dueDate.getDate() + 30);

      invoiceRecords.push({
        id: invoiceId,
        invoiceNo: `INV-2026-T${term.termNumber}-${counter}`,
        studentId: student.id,
        termId: term.id,
        totalAmount,
        paidAmount,
        balance,
        dueDate,
        createdAt: new Date(term.startDate),
        updatedAt: new Date(term.startDate),
      });

      if (paidAmount > 0) {
        const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const randMonth = term.termNumber === 1 ? Math.floor(Math.random() * 3) + 1 : (term.termNumber === 2 ? Math.floor(Math.random() * 3) + 5 : 9);
        const payDate = new Date(`2026-0${randMonth}-12T09:30:00Z`);
        const mpesaRef = `QA${Math.floor(100000 + Math.random() * 900000)}K`;

        paymentRecords.push({
          id: crypto.randomUUID(),
          amount: paidAmount,
          method,
          status: PaymentStatus.COMPLETED,
          transactionRef: method === PaymentMethod.MPESA ? mpesaRef : `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          mpesaReceiptNo: method === PaymentMethod.MPESA ? mpesaRef : null,
          studentId: student.id,
          invoiceId: invoiceId,
          paidAt: payDate,
          createdAt: payDate,
        });
      }
    }
  }

  await prisma.studentInvoice.createMany({ data: invoiceRecords });
  console.log(`Created ${invoiceRecords.length} invoices.`);

  await prisma.payment.createMany({ data: paymentRecords });
  console.log(`Created ${paymentRecords.length} payment records.`);

  // 4. Fast Attendance Generation for 14 school days
  console.log('Generating attendance records...');
  const today = new Date('2026-09-01T08:00:00Z');
  const term3 = terms.find(t => t.termNumber === 3) || terms[0];
  const attendanceDates = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      attendanceDates.push(d);
    }
  }

  const attendanceRecords = [];
  for (const student of students) {
    if (!student.classId) continue;
    for (const d of attendanceDates) {
      const rand = Math.random();
      let status = AttendanceStatus.PRESENT;
      let notes = null;
      if (rand > 0.95) {
        status = AttendanceStatus.ABSENT;
        notes = 'Reported unwell';
      } else if (rand > 0.91) {
        status = AttendanceStatus.LATE;
        notes = 'Delayed commute';
      }

      attendanceRecords.push({
        id: crypto.randomUUID(),
        date: d,
        status,
        notes,
        studentId: student.id,
        classId: student.classId,
        termId: term3.id,
        createdAt: d,
      });
    }
  }

  // Bulk insert attendance
  for (let i = 0; i < attendanceRecords.length; i += 1000) {
    const chunk = attendanceRecords.slice(i, i + 1000);
    await prisma.attendance.createMany({ data: chunk, skipDuplicates: true });
  }
  console.log(`Created ${attendanceRecords.length} attendance records.`);

  // 5. Official Announcements
  console.log('Publishing announcements...');
  await prisma.announcement.createMany({
    data: [
      {
        id: crypto.randomUUID(),
        title: 'Term 3 2026 Academic Opening & CBC Continuous Assessments',
        content: 'Welcome all learners, teachers, and guardians to Term 3. Summative and formative assessment entries will be submitted through the portal. Please ensure all class registers and course plans are updated.',
        targetRoles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'BURSAR'],
        isPublished: true,
        publishedAt: new Date('2026-09-01T06:00:00Z'),
        createdAt: new Date('2026-09-01T06:00:00Z'),
        updatedAt: new Date('2026-09-01T06:00:00Z'),
      },
      {
        id: crypto.randomUUID(),
        title: 'Sub-County Junior Athletics & Creative Arts Exhibition',
        content: 'Matundu Primary School will host the Sub-County Junior Athletics and Creative Arts Exhibition on Friday, 18th September. All grade streams are preparing student projects and presentations.',
        targetRoles: ['TEACHER', 'STUDENT', 'PARENT'],
        isPublished: true,
        publishedAt: new Date('2026-08-28T09:30:00Z'),
        createdAt: new Date('2026-08-28T09:30:00Z'),
        updatedAt: new Date('2026-08-28T09:30:00Z'),
      },
      {
        id: crypto.randomUUID(),
        title: 'Term 3 Fee Clearance & Automated M-Pesa Receipts',
        content: 'Parents and guardians are reminded that Term 3 fee balances can be settled via M-Pesa Paybill with instant automated SMS receipt confirmation and dashboard synchronization.',
        targetRoles: ['BURSAR', 'PARENT', 'STUDENT'],
        isPublished: true,
        publishedAt: new Date('2026-08-25T14:00:00Z'),
        createdAt: new Date('2026-08-25T14:00:00Z'),
        updatedAt: new Date('2026-08-25T14:00:00Z'),
      },
    ]
  });

  console.log('--- Fast Data Enrichment Completed Successfully ---');
}

enrich()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
