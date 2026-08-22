/**
 * Import Grade 8 learners from the NEMIS/CBA register provided by the user.
 * 27 learners total.
 * Uses the same pattern as the original import_students.js script.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Format Kenyan phone number to international standard +254...
function formatPhone(phoneStr) {
  if (!phoneStr) return null;
  const clean = String(phoneStr).trim().replace(/\D/g, '');
  if (clean.startsWith('254')) return `+${clean}`;
  if (clean.startsWith('0')) return `+254${clean.slice(1)}`;
  if (clean.startsWith('7') || clean.startsWith('1')) return `+254${clean}`;
  return `+254${clean}`;
}

const GRADE8_STUDENTS = [
  { name: 'Mukilya Peter Muthengi', assessmentNo: 'A001767149', gender: 'Male', dob: '03.03.2008', parent: 'Mukilia Musembi', idNo: '36963194', phone: '715746404' },
  { name: 'Mbungi Tabitha Mwikali', assessmentNo: 'A001767218', gender: 'Female', dob: '06.06.2011', parent: 'Joyce Kunyiva Mang\'uye', idNo: '30276351', phone: '713037360' },
  { name: 'Kisemei Lucy Ndusya', assessmentNo: 'A001767293', gender: 'Female', dob: '01.05.2011', parent: 'Muthini Ituku', idNo: '13093882', phone: '705019146' },
  { name: 'Musyimi Pauline Mwikali', assessmentNo: 'A001767489', gender: 'Female', dob: '01.12.2011', parent: 'Paul Musyimi Katula', idNo: '28065105', phone: '720834743' },
  { name: 'Mwangu Maurine Kaluki', assessmentNo: 'A001767732', gender: 'Female', dob: '27.08.2012', parent: 'Mwangu Kula', idNo: '12961599', phone: '738762963' },
  { name: 'Muema Rose Kanini', assessmentNo: 'A001767801', gender: 'Female', dob: '06.06.2012', parent: 'Musilili Muema', idNo: '30571815', phone: '707889400' },
  { name: 'Kisinga Tina Dericah', assessmentNo: 'A001798611', gender: 'Female', dob: '24.04.2012', parent: 'Mwende Kisinga', idNo: '33786295', phone: '745437170' },
  { name: 'Juma Mary Mwinde', assessmentNo: 'A001798660', gender: 'Female', dob: '22.06.2011', parent: 'Juma Musyoka', idNo: '11857017', phone: '726809189' },
  { name: 'Musee Cecilia Kanini', assessmentNo: 'A001798805', gender: 'Female', dob: '22.06.2012', parent: 'Musee Kithikii', idNo: '10435253', phone: '705231677' },
  { name: 'Mwendwa Natasha Alice', assessmentNo: 'A001798849', gender: 'Female', dob: '01.12.2011', parent: 'Mwendwa Muthoka', idNo: '21196045', phone: '705168385' },
  { name: 'Kiteme Timothy Malombe', assessmentNo: 'A001799471', gender: 'Male', dob: '13.04.2012', parent: 'Catherine Mwende Kiteme', idNo: '30260465', phone: '799240999' },
  { name: 'Ndunda Nzina', assessmentNo: 'A001804497', gender: 'Male', dob: '22.11.2011', parent: 'Nzina Ndunda', idNo: '24143949', phone: '700260803' },
  { name: 'Kioko Michael', assessmentNo: 'A001804551', gender: 'Male', dob: '04.06.2012', parent: 'Kioko Ndolo', idNo: '10694025', phone: '741014990' },
  { name: 'Njogu Peter', assessmentNo: 'A001804618', gender: 'Male', dob: '28.03.2012', parent: 'Njogu Kiamba', idNo: '24109503', phone: '726773009' },
  { name: 'Mulinge Marlon', assessmentNo: 'A001804677', gender: 'Male', dob: '20.06.2012', parent: 'Monica Mulinge', idNo: '22621800', phone: '740746839' },
  { name: 'Nyamai Makena', assessmentNo: 'A001804755', gender: 'Female', dob: '14.10.2011', parent: 'Nyamai Muema', idNo: '24186009', phone: '740660826' },
  { name: 'Ngumbau', assessmentNo: 'A001804821', gender: 'Male', dob: '10.05.2011', parent: 'Ngumbau Katumbi', idNo: '22461297', phone: '716423413' },
  { name: 'Kimeu Delight', assessmentNo: 'A001804882', gender: 'Male', dob: '17.01.2012', parent: 'Kimeu Mwinzi', idNo: '22444423', phone: '729987024' },
  { name: 'Muli Junior', assessmentNo: 'A001831990', gender: 'Male', dob: '12.07.2012', parent: 'Muli Muasya', idNo: '29802037', phone: '714447555' },
  { name: 'Katele Jayden', assessmentNo: 'A001832017', gender: 'Male', dob: '06.10.2011', parent: 'Katele Muasya', idNo: '24102429', phone: '769543218' },
  { name: 'Mumo Lewis', assessmentNo: 'A001887296', gender: 'Male', dob: '04.08.2011', parent: 'Mumo Mbai', idNo: '22476803', phone: '704547735' },
  { name: 'Kithome Gabriel', assessmentNo: 'A001887392', gender: 'Male', dob: '02.02.2012', parent: 'Kithome Muthoka', idNo: '21179973', phone: '794697866' },
  { name: 'Musee Japheth', assessmentNo: 'A001913076', gender: 'Male', dob: '09.04.2012', parent: 'Musee Mulinga', idNo: '24143909', phone: '747618291' },
  { name: 'Mwinzi Sylvia', assessmentNo: 'A001914098', gender: 'Female', dob: '13.03.2012', parent: 'Mwinzi Mutiso', idNo: '22455655', phone: '700297575' },
  { name: 'Mutiso Kelvin', assessmentNo: 'A001946802', gender: 'Male', dob: '14.09.2012', parent: 'Mutiso Mulinge', idNo: '24149048', phone: '725804199' },
  { name: 'Ngui Faith', assessmentNo: 'A001947178', gender: 'Female', dob: '28.10.2011', parent: 'Ngui Musyoka', idNo: '21196044', phone: '703367555' },
  { name: 'Muthui Mercy', assessmentNo: 'A001966399', gender: 'Female', dob: '22.12.2012', parent: 'Muthui Mbuvi', idNo: '36942766', phone: '714987123' },
];

function parseDOB(dobStr) {
  if (!dobStr) return new Date('2012-01-01');
  const parts = dobStr.trim().split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date('2012-01-01');
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

async function main() {
  console.log('=== Importing Grade 8 Students (27 learners) ===\n');

  // Find current student count to continue admission numbering
  const currentStudentCount = await prisma.student.count();
  console.log(`Current students in DB: ${currentStudentCount}`);

  // Find Grade 8 class
  const grade8Class = await prisma.class.findFirst({
    where: { grade: { level: 8 } },
    include: { grade: true },
  });
  if (!grade8Class) {
    // Create grade and class if needed
    let grade8 = await prisma.grade.findFirst({ where: { level: 8 } });
    if (!grade8) {
      grade8 = await prisma.grade.create({
        data: { level: 8, name: 'Grade 8' },
      });
      console.log('Created Grade 8');
    }
    const academicYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const newClass = await prisma.class.create({
      data: { gradeId: grade8.id, academicYearId: academicYear.id, capacity: 50 },
    });
    console.log(`Created Grade 8 class: ${newClass.id}`);
    // Re-fetch
    return main();
  }
  console.log(`Target class: ${grade8Class.grade.name} (${grade8Class.id})\n`);

  const defaultPassword = await bcrypt.hash('admin', 12);
  let admCounter = currentStudentCount + 1;
  let imported = 0;
  let skipped = 0;

  for (const s of GRADE8_STUDENTS) {
    // Check if already exists by assessment number
    const existing = await prisma.student.findFirst({
      where: { assessmentNumber: s.assessmentNo },
    });
    if (existing) {
      console.log(`⏭  Skipped (exists): ${s.name} (${s.assessmentNo})`);
      skipped++;
      continue;
    }

    const admNo = `MAT/2026/${String(admCounter).padStart(4, '0')}`;
    const { firstName, lastName } = splitName(s.name);
    const dob = parseDOB(s.dob);
    const parentPhone = formatPhone(s.phone);
    const email = `student.${admCounter}@matundu.ac.ke`;

    try {
      // 1. Create Student User
      const user = await prisma.user.create({
        data: {
          email,
          password: defaultPassword,
          role: 'STUDENT',
          phone: null,
        },
      });

      // 2. Create Student Record
      const student = await prisma.student.create({
        data: {
          userId: user.id,
          admissionNumber: admNo,
          firstName: firstName.toUpperCase(),
          lastName: lastName.toUpperCase(),
          gender: s.gender,
          dateOfBirth: dob,
          admissionDate: new Date('2026-01-05'),
          classId: grade8Class.id,
          admissionStatus: 'APPROVED',
          assessmentNumber: s.assessmentNo,
          sneStatus: 'NO',
        },
      });

      // 3. Create or Link Guardian
      if (s.parent) {
        const parentParts = splitName(s.parent);
        let guardian = null;

        if (s.idNo) {
          guardian = await prisma.guardian.findFirst({ where: { nationalId: s.idNo } });
        }
        if (!guardian && parentPhone) {
          const existingParentUser = await prisma.user.findFirst({ where: { phone: parentPhone } });
          if (existingParentUser) {
            guardian = await prisma.guardian.findFirst({ where: { userId: existingParentUser.id } });
          }
        }

        if (!guardian) {
          let userPhone = parentPhone;
          if (userPhone) {
            const phoneInUse = await prisma.user.findFirst({ where: { phone: userPhone } });
            if (phoneInUse) userPhone = null;
          }

          const parentUser = await prisma.user.create({
            data: {
              email: `parent.${admCounter}@matundu.ac.ke`,
              password: defaultPassword,
              role: 'PARENT',
              phone: userPhone,
            },
          });

          guardian = await prisma.guardian.create({
            data: {
              userId: parentUser.id,
              firstName: parentParts.firstName,
              lastName: parentParts.lastName,
              nationalId: s.idNo || null,
              relationship: 'PARENT',
            },
          });
        }

        await prisma.studentGuardian.create({
          data: {
            studentId: student.id,
            guardianId: guardian.id,
            isPrimary: true,
          },
        });
      }

      imported++;
      console.log(`✅ [${admCounter}] ${admNo}: ${s.name} (${s.gender}) -> Grade 8 | Assess: ${s.assessmentNo}`);
      admCounter++;
    } catch (err) {
      console.error(`❌ Failed: ${s.name} - ${err.message}`);
      admCounter++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Total:    ${GRADE8_STUDENTS.length}`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
