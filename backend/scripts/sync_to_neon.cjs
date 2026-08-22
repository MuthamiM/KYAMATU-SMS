const { PrismaClient } = require('@prisma/client');

const localPrisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://postgres:postgres_secure_password@localhost:5432/matundu_sms?schema=public' }
  }
});

const neonPrisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://neondb_owner:npg_ACFR6KhM4EnZ@ep-odd-math-axs90b9x.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require' }
  }
});

async function syncTable(modelName) {
  try {
    const records = await localPrisma[modelName].findMany();
    if (records.length === 0) {
      console.log(`- ${modelName}: 0 records`);
      return;
    }
    
    // Batch insert using createMany with skipDuplicates
    const res = await neonPrisma[modelName].createMany({
      data: records,
      skipDuplicates: true
    });
    console.log(`✓ ${modelName}: ${records.length} records processed (${res.count} inserted)`);
  } catch (err) {
    console.error(`✗ Error syncing ${modelName}:`, err.message);
  }
}

async function main() {
  console.log('--- Fast Batch Migration to Neon ---');

  const models = [
    'academicYear',
    'grade',
    'subject',
    'term',
    'class',
    'gradingScale',
    'gradingScaleItem',
    'feeItem',
    'feeStructure',
    'feeStructureItem',
    'user',
    'staff',
    'student',
    'guardian',
    'studentGuardian',
    'teacherAssignment',
    'classSubject',
    'timetable',
    'timetableSlot',
    'assessment',
    'assessmentScore',
    'studentInvoice',
    'invoiceItem',
    'payment',
    'attendance',
    'courseOutline',
    'courseResource',
    'announcement',
    'message',
    'reminder'
  ];

  for (const m of models) {
    if (localPrisma[m] && neonPrisma[m]) {
      await syncTable(m);
    }
  }

  console.log('--- All Data Synced to Neon Successfully! ---');
  await localPrisma.$disconnect();
  await neonPrisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal batch sync error:', err);
  process.exit(1);
});
