import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const term = await prisma.term.findFirst({
    where: { name: 'Term 1' },
    include: { academicYear: true },
  });

  if (!term) {
    console.error('Term 1 not found. Run main seed first.');
    return;
  }

  const students = await prisma.student.findMany({
    include: { class: true },
  });

  const subjects = await prisma.subject.findMany();

  console.log(`Found ${students.length} students and ${subjects.length} subjects.`);

  // Create Assessments
  const assessments = [];
  const assessmentTypes = [
    { name: 'Opener Exam', maxScore: 30, weight: 0.3 },
    { name: 'Mid Term Exam', maxScore: 30, weight: 0.3 },
    { name: 'End Term Exam', maxScore: 40, weight: 0.4 },
  ];

  // Group assessments by subject and grade (since subjects are grade-specific in schema usually)
  // For simplicity, we'll create assessments for each subject available
  // But wait, subjects are grade specific? Let's check prisma schema if needed.
  // Assuming subjects are linked to grades, and assessments link to subjects.

  for (const subject of subjects) {
     for (const type of assessmentTypes) {
        const assessment = await prisma.assessment.create({
          data: {
            name: type.name,
            termId: term.id,
            subjectId: subject.id,
            maxScore: type.maxScore,
            weight: type.weight,
            date: new Date(),
          }
        });
        assessments.push({ ...assessment, subjectId: subject.id });
     }
  }

  console.log(`Created ${assessments.length} assessments.`);

  // Create Scores
  let scoreCount = 0;
  for (const student of students) {
    // Find subjects for student's grade
    // In current seed, all subjects are linked to Grade 4... 
    // Wait, my previous seed created subjects for 'Grade 4' only (lines 103: gradeId: grade4.id).
    // And I created students in Grade 1-6.
    // This is a problem. Grade 1 students won't have Grade 4 subjects?
    // Let's verify if `ClassSubject` links exist.
    // The previous seed (step 372) linked subjects to `class4East`.
    // My overwriting seed (step 374) did NOT create subjects for all grades!
    
    // Actually, step 374 seed:
    // "const cbcSubjects = [...]" lines 88-99 were REMOVED in my overwrite?
    // Let me check my overwrite content in Step 374.
    // NO! I removed the subject creation logic in step 374! 
    // I only created users, grades, streams, classes, but NO SUBJECTS!
    
    // THIS IS THE ROOT CAUSE. No subjects = No assessments = No report cards.
    
    // I need to:
    // 1. Update the main seed to distinctively create subjects for ALL grades.
    // 2. Re-run the main seed.
    // 3. Then run this assessment seeder (or merge it).
    
    // I'll merge them into a single robust seed file.
  }
}
