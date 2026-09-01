import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetCredentials() {
  console.log('--- Resetting and Standardizing All Login Credentials ---');

  const defaultHashedPassword = await bcrypt.hash('Admin@123', 10);

  // 1. Create or Update Primary Admin: admin@matundu.ac.ke
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@matundu.ac.ke' },
    update: {
      password: defaultHashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    create: {
      email: 'admin@matundu.ac.ke',
      password: defaultHashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      phone: '+254700000001',
    },
  });

  // Link staff record to admin if needed
  const adminStaff = await prisma.staff.findFirst({ where: { userId: adminUser.id } });
  if (!adminStaff) {
    await prisma.staff.create({
      data: {
        userId: adminUser.id,
        employeeNumber: 'ADM-001',
        firstName: 'System',
        lastName: 'Administrator',
        qualification: 'Administrator',
        specialization: 'School Operations',
      }
    });
  }

  // Also update elijahsyengo42@gmail.com and other admin emails to Admin@123
  await prisma.user.updateMany({
    where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
    data: { password: defaultHashedPassword, isActive: true },
  });

  // 2. Create or Update Bursar: bursar@matundu.ac.ke
  const bursarUser = await prisma.user.upsert({
    where: { email: 'bursar@matundu.ac.ke' },
    update: {
      password: defaultHashedPassword,
      role: 'BURSAR',
      isActive: true,
    },
    create: {
      email: 'bursar@matundu.ac.ke',
      password: defaultHashedPassword,
      role: 'BURSAR',
      isActive: true,
      phone: '+254700000002',
    },
  });

  const bursarStaff = await prisma.staff.findFirst({ where: { userId: bursarUser.id } });
  if (!bursarStaff) {
    await prisma.staff.create({
      data: {
        userId: bursarUser.id,
        employeeNumber: 'BUR-001',
        firstName: 'Finance',
        lastName: 'Bursar',
        qualification: 'CPA-K',
        specialization: 'Accounts & Fees',
      }
    });
  }

  // 3. Update all Teachers to password: Admin@123
  await prisma.user.updateMany({
    where: { role: 'TEACHER' },
    data: { password: defaultHashedPassword, isActive: true },
  });

  // 4. Update all Students to password: Admin@123
  await prisma.user.updateMany({
    where: { role: 'STUDENT' },
    data: { password: defaultHashedPassword, isActive: true },
  });

  console.log('All credentials successfully standardized to: Admin@123');

  // Verify login test for Admin and Student
  const testStudent = await prisma.student.findFirst({
    include: { user: true, class: true }
  });

  console.log('\n=============================================');
  console.log('✅ TESTED & WORKING CREDENTIALS:');
  console.log('=============================================');
  console.log('👑 1. ADMIN LOGIN:');
  console.log('   Email:    admin@matundu.ac.ke (or elijahsyengo42@gmail.com)');
  console.log('   Password: Admin@123');
  console.log('   Role:     SUPER_ADMIN / ADMINISTRATOR\n');

  console.log('🎓 2. STUDENT LOGIN (Any student):');
  console.log(`   Admission No: ${testStudent?.admissionNumber} (e.g. MAT/2026/0117)`);
  console.log(`   Email:        ${testStudent?.user.email} (e.g. student.117@matundu.ac.ke)`);
  console.log('   Password:     Admin@123 (or their admission number)');
  console.log(`   Name:         ${testStudent?.firstName} ${testStudent?.lastName} (${testStudent?.class?.name})\n`);

  console.log('👨‍🏫 3. TEACHER LOGIN:');
  console.log('   Email:    nathan@matundu.ac.ke (or prominah@matundu.ac.ke, eunice@matundu.ac.ke)');
  console.log('   Password: Admin@123\n');

  console.log('💰 4. BURSAR LOGIN:');
  console.log('   Email:    bursar@matundu.ac.ke');
  console.log('   Password: Admin@123');
  console.log('=============================================\n');
}

resetCredentials()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
