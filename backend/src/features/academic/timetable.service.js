import prisma from '../../config/database.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

export const getTimetable = async (classId) => {
  const slots = await prisma.timetableSlot.findMany({
    where: { classId },
    include: {
      subject: true,
      teacher: {
        include: { user: { select: { firstName: true, lastName: true } } }
      }
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
  });
  return slots;
};

export const getTeacherTimetable = async (staffId) => {
  const slots = await prisma.timetableSlot.findMany({
    where: { teacherId: staffId },
    include: {
      subject: true,
      class: { include: { grade: true, stream: true } }
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
  });
  return slots;
};

export const upsertTimetableSlot = async (data) => {
  const { classId, dayOfWeek, startTime, endTime, teacherId } = data;

  // Check for conflicts (Overlaps)
  // 1. Class conflict: Same class cannot have 2 lessons at same time
  const classConflict = await prisma.timetableSlot.findFirst({
    where: {
      classId,
      dayOfWeek,
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } }
      ],
      NOT: { id: data.id || undefined }
    }
  });

  if (classConflict) {
    throw new ConflictError('Class already has a lesson at this time');
  }

  // 2. Teacher conflict: Same teacher cannot teach 2 classes at same time (if teacher assigned)
  if (teacherId) {
    const teacherConflict = await prisma.timetableSlot.findFirst({
      where: {
        teacherId,
        dayOfWeek,
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ],
        NOT: { id: data.id || undefined }
      }
    });

    if (teacherConflict) {
      throw new ConflictError('Teacher is already assigned to another class at this time');
    }
  }

  if (data.id) {
    return prisma.timetableSlot.update({
      where: { id: data.id },
      data,
      include: { subject: true, teacher: true }
    });
  } else {
    return prisma.timetableSlot.create({
      data,
      include: { subject: true, teacher: true }
    });
  }
};

export const generateTimetable = async () => {
  // 1. Clear existing timetable? For now, yes, to avoid conflicts with old data.
  // In production, might want 'generate for specific class' or 'fill empty'.
  await prisma.timetableSlot.deleteMany({});

  // 2. Fetch all classes and their teacher assignments
  const classes = await prisma.class.findMany({
    include: {
      teacherAssignments: {
        include: { subject: true }
      }
    }
  });

  // Default lesson mapping (Subject Name -> Count per week)
  // Adjust based on typical curriculum
  const lessonCounts = {
    'Mathematics': 5,
    'English': 5,
    'Kiswahili': 5,
    'Science': 4,
    'Social Studies': 3,
    'CRE': 2,
    'Creative Arts': 2,
    'Digital Literacy': 2,
    'Agriculture': 3
  };
  const defaultCount = 3;

  const slotsToCreate = [];
  const days = [1, 2, 3, 4, 5]; // Mon-Fri
  const times = [
    '08:00 - 08:40', '08:40 - 09:20', '09:20 - 10:00',
    '10:20 - 11:00', '11:00 - 11:40', '11:40 - 12:20',
    '14:00 - 14:40', '14:40 - 15:20', '15:20 - 16:00'
  ]; // 9 slots per day

  // Pre-calculate needed slots for all classes
  const allClassesNeeded = [];
  
  for (const cls of classes) {
    const classNeeded = [];
    for (const assign of cls.teacherAssignments) {
      const count = lessonCounts[assign.subject.name] || defaultCount;
      for (let i = 0; i < count; i++) {
        classNeeded.push({
          classId: cls.id,
          subjectId: assign.subject.id,
          teacherId: assign.staffId,
          subjectName: assign.subject.name
        });
      }
    }
    // Shuffle for randomness
    allClassesNeeded.push({ classId: cls.id, needed: classNeeded.sort(() => Math.random() - 0.5) });
  }

  // Greedy Assignment
  // Track teacher busy times: teacherId -> Set("day-time")
  const teacherBusy = new Set(); 

  for (const day of days) {
    for (const time of times) {
      for (const clsData of allClassesNeeded) {
        // Try to find a lesson for this class, this day, this time
        const lessonIndex = clsData.needed.findIndex(lesson => {
           // Check if teacher is free
           if (!lesson.teacherId) return true; // No teacher assigned yet? Allow.
           return !teacherBusy.has(`${lesson.teacherId}-${day}-${time}`);
        });

        if (lessonIndex !== -1) {
          const lesson = clsData.needed[lessonIndex];
          
          // Assign it
          slotsToCreate.push({
            dayOfWeek: day,
            startTime: time.split(' - ')[0],
            endTime: time.split(' - ')[1],
            classId: lesson.classId,
            subjectId: lesson.subjectId,
            teacherId: lesson.teacherId
          });

          // Mark teacher busy
          if (lesson.teacherId) {
            teacherBusy.add(`${lesson.teacherId}-${day}-${time}`);
          }

          // Remove from needed
          clsData.needed.splice(lessonIndex, 1);
        }
      }
    }
  }

  // Bulk create
  if (slotsToCreate.length > 0) {
    await prisma.timetableSlot.createMany({ data: slotsToCreate });
  }
  
  return { generated: slotsToCreate.length };
};

export const deleteTimetableSlot = async (id) => {
  await prisma.timetableSlot.delete({ where: { id } });
};
