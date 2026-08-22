import prisma from '../../config/database.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

export const getTimetable = async (classId) => {
  const slots = await prisma.timetableSlot.findMany({
    where: { classId },
    include: {
      subject: true,
      teacher: {
        select: {
          firstName: true,
          lastName: true
        }
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
      class: { include: { grade: true, stream: true } },
      teacher: {
        select: {
          firstName: true,
          lastName: true
        }
      }
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
  // 1. Check for registered teachers
  const teachers = await prisma.staff.findMany({
    where: {
      user: {
        role: { in: ['TEACHER', 'ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      }
    },
    include: { user: true }
  });

  const realTeachers = teachers.filter(t => t.user?.role === 'TEACHER');
  const availableTeachers = realTeachers.length > 0 ? realTeachers : teachers;

  if (availableTeachers.length === 0) {
    throw new ValidationError('No teachers found in the system. Please add your school teachers in the Staff page first, then generate the timetable.');
  }

  // 2. Fetch all classes and their subjects
  const classes = await prisma.class.findMany({
    include: {
      grade: true,
      classSubjects: { include: { subject: true } },
      teacherAssignments: { include: { subject: true } }
    }
  });

  if (classes.length === 0) {
    throw new ValidationError('No classes found in the system.');
  }

  const allSubjects = await prisma.subject.findMany();

  // 3. Assign teachers to class subjects evenly if not already assigned
  for (const cls of classes) {
    const classSubjectList = cls.classSubjects.length > 0 
      ? cls.classSubjects 
      : allSubjects.filter(s => s.gradeId === cls.gradeId).map(s => ({ subjectId: s.id, subject: s }));

    for (let i = 0; i < classSubjectList.length; i++) {
      const cs = classSubjectList[i];
      // Pick teacher in round-robin based on class & subject index
      const assignedTeacher = availableTeachers[(i + (cls.grade?.level || 1)) % availableTeachers.length];

      const existingAssignment = await prisma.teacherAssignment.findFirst({
        where: {
          classId: cls.id,
          subjectId: cs.subjectId,
        }
      });

      if (!existingAssignment) {
        try {
          await prisma.teacherAssignment.create({
            data: {
              staffId: assignedTeacher.id,
              classId: cls.id,
              subjectId: cs.subjectId,
              isClassTeacher: i === 0,
            }
          });
        } catch (e) {
          // ignore duplicate
        }
      }
    }
  }

  // 4. Clear existing timetable slots
  await prisma.timetableSlot.deleteMany({});

  // 5. Re-fetch all classes with fresh teacher assignments
  const refreshedClasses = await prisma.class.findMany({
    include: {
      grade: true,
      teacherAssignments: {
        include: { subject: true }
      }
    }
  });

  // Standard 9 periods per day
  const days = [1, 2, 3, 4, 5]; // Monday to Friday
  const periods = [
    { start: '08:00', end: '08:40' },
    { start: '08:40', end: '09:20' },
    { start: '09:20', end: '10:00' },
    { start: '10:20', end: '11:00' },
    { start: '11:00', end: '11:40' },
    { start: '11:40', end: '12:20' },
    { start: '14:00', end: '14:40' },
    { start: '14:40', end: '15:20' },
    { start: '15:20', end: '16:00' }
  ];

  const slotsToCreate = [];
  const teacherBusy = new Set();

  for (const cls of refreshedClasses) {
    const assignments = cls.teacherAssignments;
    if (assignments.length === 0) continue;

    let assignIdx = 0;
    for (const day of days) {
      for (const period of periods) {
        const assign = assignments[assignIdx % assignments.length];
        assignIdx++;

        let teacherId = assign.staffId;
        // Check if teacher is already busy at this time slot
        if (teacherId && teacherBusy.has(`${teacherId}-${day}-${period.start}`)) {
          // Avoid clash: find alternate teacher or slot without clash
          const freeTeacher = availableTeachers.find(t => !teacherBusy.has(`${t.id}-${day}-${period.start}`));
          teacherId = freeTeacher ? freeTeacher.id : null;
        }

        slotsToCreate.push({
          dayOfWeek: day,
          startTime: period.start,
          endTime: period.end,
          classId: cls.id,
          subjectId: assign.subjectId,
          teacherId: teacherId || null,
        });

        if (teacherId) {
          teacherBusy.add(`${teacherId}-${day}-${period.start}`);
        }
      }
    }
  }

  // 6. Bulk create slots
  if (slotsToCreate.length > 0) {
    const chunkSize = 100;
    for (let i = 0; i < slotsToCreate.length; i += chunkSize) {
      await prisma.timetableSlot.createMany({
        data: slotsToCreate.slice(i, i + chunkSize)
      });
    }
  }

  return {
    generated: slotsToCreate.length,
    teachersCount: availableTeachers.length,
    classesCount: refreshedClasses.length
  };
};

export const deleteTimetableSlot = async (id) => {
  await prisma.timetableSlot.delete({ where: { id } });
};

export const getNextLesson = async (teacherId) => {
  const date = new Date();
  const currentDay = date.getDay(); // 0=Sun, 1=Mon... 
  // Note: System uses 1-5 for Mon-Fri. If Sun(0) or Sat(6), we treat as weekend.

  const currentTime = date.toTimeString().slice(0, 5); // "HH:MM"

  // Fetch all slots for teacher, sorted by week schedule
  const slots = await prisma.timetableSlot.findMany({
    where: { teacherId },
    include: {
      subject: true,
      class: { include: { grade: true, stream: true } }
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
  });

  if (slots.length === 0) return null;

  // 1. Check later today
  let next = slots.find(s => s.dayOfWeek === currentDay && s.startTime > currentTime);

  // 2. Check later this week
  if (!next) {
    next = slots.find(s => s.dayOfWeek > currentDay);
  }

  // 3. Wrap around to next week (first slot)
  if (!next) {
    next = slots[0];
  }

  return next;
};

export const getMasterTimetable = async () => {
  const slots = await prisma.timetableSlot.findMany({
    include: {
      subject: true,
      class: { include: { grade: true, stream: true } },
      teacher: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }, { class: { name: 'asc' } }]
  });
  return slots;
};
