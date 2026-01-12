import prisma from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';
import { paginationMeta } from '../../utils/helpers.js';

export const createAcademicYear = async (data) => {
  if (data.isCurrent) {
    await prisma.academicYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
  }
  
  const academicYear = await prisma.academicYear.create({
    data,
    include: { terms: true },
  });
  
  return academicYear;
};

export const getAcademicYears = async () => {
  const years = await prisma.academicYear.findMany({
    include: { terms: true },
    orderBy: { startDate: 'desc' },
  });
  return years;
};

export const getCurrentAcademicYear = async () => {
  const year = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
    include: { terms: true },
  });
  return year;
};

export const setCurrentYear = async (id) => {
  await prisma.academicYear.updateMany({
    where: { isCurrent: true },
    data: { isCurrent: false },
  });
  
  const year = await prisma.academicYear.update({
    where: { id },
    data: { isCurrent: true },
  });
  
  return year;
};

export const createTerm = async (data) => {
  const term = await prisma.term.create({
    data,
    include: { academicYear: true },
  });
  return term;
};

export const getTerms = async (academicYearId) => {
  const where = academicYearId ? { academicYearId } : {};
  const terms = await prisma.term.findMany({
    where,
    include: { academicYear: true },
    orderBy: { termNumber: 'asc' },
  });
  return terms;
};

export const createGrade = async (data) => {
  const grade = await prisma.grade.create({ data });
  return grade;
};

export const getGrades = async () => {
  const grades = await prisma.grade.findMany({
    orderBy: { level: 'asc' },
  });
  return grades;
};

export const createStream = async (data) => {
  const stream = await prisma.stream.create({ data });
  return stream;
};

export const getStreams = async () => {
  const streams = await prisma.stream.findMany({
    orderBy: { name: 'asc' },
  });
  return streams;
};

export const createClass = async (data) => {
  const existingClass = await prisma.class.findUnique({
    where: {
      gradeId_streamId_academicYearId: {
        gradeId: data.gradeId,
        streamId: data.streamId,
        academicYearId: data.academicYearId,
      },
    },
  });
  
  if (existingClass) {
    throw new Error('Class already exists for this grade, stream, and year');
  }
  
  const classRecord = await prisma.class.create({
    data,
    include: {
      grade: true,
      stream: true,
      academicYear: true,
    },
  });
  
  return classRecord;
};

export const getClasses = async (filters = {}) => {
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 50;
  const { academicYearId, gradeId } = filters;
  const skip = (page - 1) * limit;
  
  const where = {};
  if (academicYearId) where.academicYearId = academicYearId;
  if (gradeId) where.gradeId = gradeId;
  
  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      skip,
      take: limit,
      include: {
        grade: true,
        stream: true,
        academicYear: true,
        _count: { select: { students: true } },
      },
      orderBy: [{ grade: { level: 'asc' } }, { stream: { name: 'asc' } }],
    }),
    prisma.class.count({ where }),
  ]);
  
  return { classes, meta: paginationMeta(total, page, limit) };
};

export const getClassById = async (id) => {
  const classRecord = await prisma.class.findUnique({
    where: { id },
    include: {
      grade: true,
      stream: true,
      academicYear: true,
      students: {
        include: {
          user: { select: { email: true } },
        },
      },
      teacherAssignments: {
        include: {
          staff: true,
          subject: true,
        },
      },
      classSubjects: {
        include: { subject: true },
      },
    },
  });
  
  if (!classRecord) {
    throw new NotFoundError('Class');
  }
  
  return classRecord;
};

export const createSubject = async (data) => {
  const subject = await prisma.subject.create({
    data,
    include: { grade: true },
  });
  return subject;
};

export const getSubjects = async (gradeId) => {
  const where = gradeId ? { gradeId } : {};
  const subjects = await prisma.subject.findMany({
    where,
    include: { grade: true },
    orderBy: { name: 'asc' },
  });
  return subjects;
};

export const assignSubjectToClass = async (classId, subjectId) => {
  const assignment = await prisma.classSubject.create({
    data: { classId, subjectId },
    include: { class: true, subject: true },
  });
  return assignment;
};

export const removeSubjectFromClass = async (classId, subjectId) => {
  await prisma.classSubject.delete({
    where: {
      classId_subjectId: { classId, subjectId },
    },
  });
};
