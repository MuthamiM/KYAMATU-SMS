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

export const forceRepairDatabase = async () => {
  const logs = [];
  const log = (msg) => { console.log(msg); logs.push(msg); };

  log('🔧 Starting Force Repair...');

  const terms = await prisma.term.findMany({
    where: { academicYear: { isCurrent: true } },
    orderBy: { termNumber: 'asc' }
  });

  if (terms.length === 0) {
    throw new Error('No current academic year/terms found to repair.');
  }

  const classes = await prisma.class.findMany({
    include: {
      teacherAssignments: {
        where: { isClassTeacher: true },
        select: { staffId: true }
      }
    }
  });
  const subjects = await prisma.subject.findMany();
  const anyStaff = await prisma.staff.findFirst();

  const subjectResourceMap = {
    'Mathematics': { url: 'https://www.khanacademy.org/math', title: 'Khan Academy Mathematics', type: 'LINK' },
    'English': { url: 'https://learnenglish.britishcouncil.org/', title: 'British Council English Learning', type: 'LINK' },
    'Kiswahili': { url: 'https://www.bbc.com/swahili', title: 'BBC Kiswahili Resources', type: 'LINK' },
    'Science and Technology': { url: 'https://www.khanacademy.org/science', title: 'Khan Academy Science', type: 'LINK' },
    'Social Studies': { url: 'https://www.nationalgeographic.org/education/resource-library/', title: 'National Geographic Social Studies', type: 'LINK' },
    'CRE': { url: 'https://www.bible.com/', title: 'Bible Study Resources', type: 'LINK' },
    'Creative Arts': { url: 'https://www.tate.org.uk/learn', title: 'Tate Art Learning', type: 'LINK' },
    'PHE': { url: 'https://www.topendsports.com/resources/', title: 'Physical Education Resources', type: 'LINK' },
    'Agriculture': { url: 'https://www.fao.org/home/en/', title: 'FAO Agriculture Resources', type: 'LINK' },
    'Home Science': { url: 'https://extension.umn.edu/family-and-consumer-science', title: 'Home Science Resources', type: 'LINK' },
  };

  let outlinesCreated = 0;
  let resourcesCreated = 0;
  let resourcesFixed = 0;

  for (const term of terms) {
    for (const cls of classes) {
      for (const subj of subjects) {
        const assignment = await prisma.teacherAssignment.findFirst({
          where: { classId: cls.id, subjectId: subj.id }
        });
        const teacherId = assignment?.staffId || cls.teacherAssignments[0]?.staffId || anyStaff?.id;
        if (!teacherId) continue;

        // 1. Outline
        const existingOutline = await prisma.courseOutline.findUnique({
          where: { classId_subjectId_termId: { classId: cls.id, subjectId: subj.id, termId: term.id } }
        });

        if (!existingOutline) {
          await prisma.courseOutline.create({
            data: {
              classId: cls.id, subjectId: subj.id, termId: term.id, teacherId,
              title: `${subj.name} - ${term.name} Outline`,
              content: [
                { title: 'Introduction', description: `${subj.name} — core goals and term overview.`, type: 'LESSON', date: 'Week 1' },
                { title: 'Core Modules', description: 'Concepts and practical applications.', type: 'LESSON', date: 'Weeks 2-5' },
                { title: 'CAT', description: 'Assessment.', type: 'CAT', date: 'Week 6' },
                { title: 'Advanced', description: 'Complex topics.', type: 'LESSON', date: 'Weeks 7-9' },
                { title: 'Finals', description: 'Exam preparation.', type: 'LESSON', date: 'Week 10' }
              ]
            }
          });
          outlinesCreated++;
        }

        // 2. Resources
        const existingResource = await prisma.courseResource.findFirst({
          where: { classId: cls.id, subjectId: subj.id, termId: term.id }
        });

        const baseName = Object.keys(subjectResourceMap).find(k => subj.name.startsWith(k)) || null;
        const resourceInfo = baseName ? subjectResourceMap[baseName] : {
          url: 'https://www.open.edu/openlearn/',
          title: `${subj.name} Materials`,
          type: 'LINK'
        };

        if (!existingResource) {
          await prisma.courseResource.create({
            data: {
              classId: cls.id, subjectId: subj.id, termId: term.id, teacherId,
              title: resourceInfo.title, type: resourceInfo.type, url: resourceInfo.url
            }
          });
          resourcesCreated++;
        } else if (existingResource.url.includes('example.com')) {
          await prisma.courseResource.update({
            where: { id: existingResource.id },
            data: { url: resourceInfo.url, title: resourceInfo.title, type: resourceInfo.type }
          });
          resourcesFixed++;
        }
      }
    }
  }

  log(`✅ Done. Outlines created: ${outlinesCreated}, Resources created: ${resourcesCreated}, Fixed: ${resourcesFixed}`);
  return { logs, summary: { outlinesCreated, resourcesCreated, resourcesFixed } };
};
