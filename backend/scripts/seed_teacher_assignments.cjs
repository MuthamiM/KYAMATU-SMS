/**
 * Seed teacher assignments and link teachers to timetable slots.
 * 4 teachers → 9 grades: each teacher gets 2-3 grades, is class teacher for their first grade.
 * Also links teacherId on existing TimetableSlot records.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get actual teachers
  const teachers = await prisma.staff.findMany({
    where: { user: { role: 'TEACHER' } },
    include: { user: { select: { email: true } } },
    orderBy: { firstName: 'asc' },
  });

  console.log(`Found ${teachers.length} teachers`);
  if (teachers.length === 0) {
    console.error('No teachers found!');
    return;
  }

  // Get all classes ordered by grade level
  const classes = await prisma.class.findMany({
    include: { grade: true },
    orderBy: { grade: { level: 'asc' } },
  });

  // Get all subjects by gradeId
  const subjects = await prisma.subject.findMany();
  const subjectsByGrade = {};
  subjects.forEach(s => {
    if (!subjectsByGrade[s.gradeId]) subjectsByGrade[s.gradeId] = [];
    subjectsByGrade[s.gradeId].push(s);
  });

  // Distribute classes across teachers evenly
  // Teacher 0 (Eunice): Grades 1, 2, 3
  // Teacher 1 (Hillary): Grades 4, 5
  // Teacher 2 (Nathan): Grades 6, 7
  // Teacher 3 (Prominah): Grades 8, 9
  const teacherClassMap = {};
  teachers.forEach(t => { teacherClassMap[t.id] = []; });

  const sortedTeachers = [...teachers].sort((a, b) => a.firstName.localeCompare(b.firstName));
  // Eunice, Hillary, Nathan, Prominah
  const distribution = [
    [0, 1, 2],   // Grades 1,2,3 → teacher[0]
    [3, 4],       // Grades 4,5 → teacher[1]
    [5, 6],       // Grades 6,7 → teacher[2]
    [7, 8],       // Grades 8,9 → teacher[3]
  ];

  const assignments = [];
  for (let ti = 0; ti < sortedTeachers.length; ti++) {
    const teacher = sortedTeachers[ti];
    const classIndices = distribution[ti] || [];

    for (const ci of classIndices) {
      if (!classes[ci]) continue;
      const cls = classes[ci];
      const gradeSubjects = subjectsByGrade[cls.gradeId] || [];

      for (const subject of gradeSubjects) {
        assignments.push({
          staffId: teacher.id,
          classId: cls.id,
          subjectId: subject.id,
          isClassTeacher: ci === classIndices[0], // class teacher for first assigned grade
        });
      }
    }
  }

  console.log(`Creating ${assignments.length} teacher assignments...`);

  // Delete existing assignments first
  await prisma.teacherAssignment.deleteMany();

  // Batch create
  let created = 0;
  for (const a of assignments) {
    try {
      await prisma.teacherAssignment.create({ data: a });
      created++;
    } catch (e) {
      // skip duplicates
    }
  }
  console.log(`Created ${created} teacher assignments`);

  // Now link teachers to timetable slots based on their class+subject assignments
  const assignmentMap = {};
  const allAssignments = await prisma.teacherAssignment.findMany();
  allAssignments.forEach(a => {
    const key = `${a.classId}:${a.subjectId}`;
    assignmentMap[key] = a.staffId;
  });

  const slots = await prisma.timetableSlot.findMany();
  let linked = 0;
  for (const slot of slots) {
    const key = `${slot.classId}:${slot.subjectId}`;
    const teacherId = assignmentMap[key];
    if (teacherId && slot.teacherId !== teacherId) {
      await prisma.timetableSlot.update({
        where: { id: slot.id },
        data: { teacherId },
      });
      linked++;
    }
  }
  console.log(`Linked ${linked} timetable slots to teachers`);

  // Verify Nathan's slots
  const nathan = sortedTeachers.find(t => t.firstName === 'Nathan');
  if (nathan) {
    const nathanSlots = await prisma.timetableSlot.count({ where: { teacherId: nathan.id } });
    console.log(`Nathan now has ${nathanSlots} timetable slots`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
