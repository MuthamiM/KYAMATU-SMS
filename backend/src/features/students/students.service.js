import prisma from '../../config/database.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { generateAdmissionNumber, paginationMeta } from '../../utils/helpers.js';

export const createStudent = async (data) => {
  const admissionNumber = data.admissionNumber || generateAdmissionNumber();

  const existing = await prisma.student.findUnique({
    where: { admissionNumber },
  });

  if (existing) {
    throw new ConflictError('Admission number already exists');
  }

  const { email, password, phone, ...studentData } = data;

  const student = await prisma.student.create({
    data: {
      ...studentData,
      dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : undefined,
      admissionNumber,
      user: {
        create: {
          email,
          password,
          phone,
          role: 'STUDENT',
        },
      },
    },
    include: {
      user: {
        select: { id: true, email: true, phone: true, role: true },
      },
      class: {
        include: {
          grade: true,
          stream: true,
        },
      },
    },
  });

  return student;
};

export const getStudents = async (filters = {}) => {
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const { classId, gradeId, search, admissionStatus, checkTeacherId } = filters;
  const skip = (page - 1) * limit;

  const where = {};

  if (checkTeacherId) {
    // Find all classes assigned to this teacher
    const assignments = await prisma.teacherAssignment.findMany({
      where: { staffId: checkTeacherId },
      select: { classId: true }
    });
    const assignedClassIds = assignments.map(a => a.classId);

    // If teacher has no classes, returned empty (or handle as needed)
    if (assignedClassIds.length === 0) {
      return { students: [], meta: paginationMeta(0, page, limit) };
    }

    // Restrict query to these classes
    where.classId = { in: assignedClassIds };
  }

  if (classId) {
    // If strict classId provided, ensure it's one of the allowed ones (intersection)
    if (where.classId && !where.classId.in.includes(classId)) {
      return { students: [], meta: paginationMeta(0, page, limit) };
    }
    where.classId = classId;
  }

  if (admissionStatus) where.admissionStatus = admissionStatus;
  if (gradeId) {
    where.class = { ...where.class, gradeId };
  }
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { admissionNumber: { contains: search } },
    ];
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { email: true, phone: true } },
        class: {
          include: {
            grade: true,
            stream: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.count({ where }),
  ]);

  return { students, meta: paginationMeta(total, page, limit) };
};

export const getStudentById = async (id) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, phone: true, role: true } },
      class: {
        include: {
          grade: true,
          stream: true,
          academicYear: true,
        },
      },
      guardians: {
        include: {
          guardian: {
            include: {
              user: { select: { email: true, phone: true } },
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new NotFoundError('Student');
  }

  return student;
};

export const getStudentByAdmissionNumber = async (admissionNumber) => {
  const student = await prisma.student.findUnique({
    where: { admissionNumber },
    include: {
      user: { select: { id: true, email: true, phone: true } },
      class: {
        include: { grade: true, stream: true },
      },
    },
  });

  if (!student) {
    throw new NotFoundError('Student');
  }

  return student;
};

export const updateStudent = async (id, data) => {
  const student = await prisma.student.update({
    where: { id },
    data,
    include: {
      user: { select: { email: true, phone: true } },
      class: {
        include: { grade: true, stream: true },
      },
    },
  });

  return student;
};

export const deleteStudent = async (id) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!student) {
    throw new NotFoundError('Student');
  }

  await prisma.user.delete({
    where: { id: student.userId },
  });
};

export const approveAdmission = async (id, classId) => {
  const student = await prisma.student.update({
    where: { id },
    data: {
      admissionStatus: 'APPROVED',
      classId,
      admissionDate: new Date(),
    },
    include: {
      class: { include: { grade: true, stream: true } },
    },
  });

  return student;
};

export const rejectAdmission = async (id) => {
  const student = await prisma.student.update({
    where: { id },
    data: { admissionStatus: 'REJECTED' },
  });

  return student;
};

export const promoteStudents = async (fromClassId, toClassId) => {
  const result = await prisma.student.updateMany({
    where: { classId: fromClassId },
    data: { classId: toClassId },
  });

  return result;
};

export const getStudentsByGuardian = async (guardianId) => {
  const guardian = await prisma.guardian.findUnique({
    where: { id: guardianId },
    include: {
      students: {
        include: {
          student: {
            include: {
              class: { include: { grade: true, stream: true } },
            },
          },
        },
      },
    },
  });

  if (!guardian) {
    throw new NotFoundError('Guardian');
  }

  return guardian.students.map(sg => sg.student);
};

export const linkGuardian = async (studentId, guardianId, isPrimary = false) => {
  const link = await prisma.studentGuardian.create({
    data: {
      studentId,
      guardianId,
      isPrimary,
    },
  });

  return link;
};
