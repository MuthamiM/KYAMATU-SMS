/**
 * Purge ALL mock/auto-generated assessments from the database.
 * This removes:
 *   1. All AssessmentScore records (child FK constraint)
 *   2. All Assessment records
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('=== Purging Mock Assessments ===\n');

  // Count first
  const scoreCount = await prisma.assessmentScore.count();
  const assessmentCount = await prisma.assessment.count();
  console.log(`Found ${assessmentCount} assessments and ${scoreCount} scores`);

  // Delete scores first (FK constraint)
  if (scoreCount > 0) {
    const deletedScores = await prisma.assessmentScore.deleteMany({});
    console.log(`Deleted ${deletedScores.count} assessment scores`);
  }

  // Delete all assessments
  if (assessmentCount > 0) {
    const deletedAssessments = await prisma.assessment.deleteMany({});
    console.log(`Deleted ${deletedAssessments.count} assessments`);
  }

  console.log('\n✅ All mock assessments and scores purged successfully.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
