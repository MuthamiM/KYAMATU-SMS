import prisma from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';
import { paginationMeta } from '../../utils/helpers.js';

export const markAttendance = async (data) => {
  const { studentId, classId, termId, date, status, notes } = data;
  
  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_date: { studentId, date: new Date(date) },
    },
    update: { status, notes },
    create: {
      studentId,
      classId,
      termId,
      date: new Date(date),
      status,
      notes,
    },
  });
  
  return attendance;
};

export const markBulkAttendance = async (classId, termId, date, records) => {
  const results = await Promise.all(
    records.map(record =>
      prisma.attendance.upsert({
        where: {
          studentId_date: { studentId: record.studentId, date: new Date(date) },
        },
        update: { status: record.status, notes: record.notes },
        create: {
          studentId: record.studentId,
          classId,
          termId,
          date: new Date(date),
          status: record.status,
          notes: record.notes,
        },
      })
    )
  );
  
  return results;
};

export const getClassAttendance = async (classId, date) => {
  const classRecord = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNumber: true,
        },
      },
    },
  });
  
  if (!classRecord) {
    throw new NotFoundError('Class');
  }
  
  const attendances = await prisma.attendance.findMany({
    where: {
      classId,
      date: new Date(date),
    },
  });
  
  const attendanceMap = new Map(
    attendances.map(a => [a.studentId, a])
  );
  
  const result = classRecord.students.map(student => ({
    student,
    attendance: attendanceMap.get(student.id) || null,
  }));
  
  return result;
};

export const getStudentAttendance = async (studentId, filters = {}) => {
  const { termId, startDate, endDate, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;
  
  const where = { studentId };
  
  if (termId) where.termId = termId;
  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  
  const [attendances, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
    }),
    prisma.attendance.count({ where }),
  ]);
  
  return { attendances, meta: paginationMeta(total, page, limit) };
};

export const getAttendanceStats = async (studentId, termId) => {
  const where = { studentId };
  if (termId) where.termId = termId;
  
  const stats = await prisma.attendance.groupBy({
    by: ['status'],
    where,
    _count: { status: true },
  });
  
  const total = stats.reduce((sum, s) => sum + s._count.status, 0);
  const present = stats.find(s => s.status === 'PRESENT')?._count.status || 0;
  const absent = stats.find(s => s.status === 'ABSENT')?._count.status || 0;
  const late = stats.find(s => s.status === 'LATE')?._count.status || 0;
  const excused = stats.find(s => s.status === 'EXCUSED')?._count.status || 0;
  
  return {
    total,
    present,
    absent,
    late,
    excused,
    attendanceRate: total > 0 ? ((present + late) / total * 100).toFixed(2) : 0,
  };
};

export const getClassAttendanceReport = async (classId, termId) => {
  const students = await prisma.student.findMany({
    where: { classId },
    select: { id: true, firstName: true, lastName: true, admissionNumber: true },
  });
  
  const report = await Promise.all(
    students.map(async student => ({
      student,
      stats: await getAttendanceStats(student.id, termId),
    }))
  );
  
  return report;
};
