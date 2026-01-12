import prisma from '../../config/database.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { generateEmployeeNumber, paginationMeta } from '../../utils/helpers.js';

export const createStaff = async (data) => {
  const employeeNumber = data.employeeNumber || generateEmployeeNumber();
  
  const { email, phone, password, role, isActive, ...staffData } = data;
  
  const staff = await prisma.staff.create({
    data: {
      ...staffData,
      employeeNumber,
      user: {
        create: {
          email,
          password,
          phone,
          role: role || 'TEACHER',
          isActive: isActive !== undefined ? isActive : true, // Handle inactive users
        },
      },
    },
    include: {
      user: { select: { id: true, email: true, phone: true, role: true, isActive: true } },
    },
  });
  
  return staff;
};

export const getStaff = async (filters = {}) => {
  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const { role, search } = filters;
  const skip = (page - 1) * limit;
  
  const where = {};
  
  if (role) {
    where.user = { role };
  }
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { employeeNumber: { contains: search } },
    ];
  }
  
  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { email: true, phone: true, role: true, isActive: true } },
        teacherAssignments: {
          include: {
            class: { include: { grade: true, stream: true } },
            subject: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.staff.count({ where }),
  ]);
  
  return { staff, meta: paginationMeta(total, page, limit) };
};

export const getStaffById = async (id) => {
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, phone: true, role: true } },
      teacherAssignments: {
        include: {
          class: { include: { grade: true, stream: true, academicYear: true } },
          subject: true,
        },
      },
    },
  });
  
  if (!staff) {
    throw new NotFoundError('Staff');
  }
  
  return staff;
};

export const updateStaff = async (id, data) => {
  const staff = await prisma.staff.update({
    where: { id },
    data,
    include: {
      user: { select: { email: true, phone: true, role: true } },
    },
  });
  
  return staff;
};

export const deleteStaff = async (id) => {
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: { user: true },
  });
  
  if (!staff) {
    throw new NotFoundError('Staff');
  }
  
  await prisma.user.delete({
    where: { id: staff.userId },
  });
};

export const assignTeacher = async (data) => {
  const existing = await prisma.teacherAssignment.findUnique({
    where: {
      staffId_classId_subjectId: {
        staffId: data.staffId,
        classId: data.classId,
        subjectId: data.subjectId,
      },
    },
  });
  
  if (existing) {
    throw new ConflictError('Teacher already assigned to this class and subject');
  }
  
  const assignment = await prisma.teacherAssignment.create({
    data,
    include: {
      staff: true,
      class: { include: { grade: true, stream: true } },
      subject: true,
    },
  });
  
  return assignment;
};

export const removeTeacherAssignment = async (id) => {
  await prisma.teacherAssignment.delete({
    where: { id },
  });
};

export const getTeacherClasses = async (staffId) => {
  const assignments = await prisma.teacherAssignment.findMany({
    where: { staffId },
    include: {
      class: {
        include: {
          grade: true,
          stream: true,
          academicYear: true,
          students: {
            select: { id: true, firstName: true, lastName: true, admissionNumber: true },
          },
        },
      },
      subject: true,
    },
  });
  
  return assignments;
};
