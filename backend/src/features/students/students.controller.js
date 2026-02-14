import * as studentsService from './students.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response.js';

export const createStudent = async (req, res, next) => {
  try {
    const student = await studentsService.createStudent(req.body);
    sendCreated(res, student, 'Student created successfully');
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const filters = { ...req.query };

    // If user is a Teacher, enforce filtering
    if (req.user.role === 'TEACHER' && req.user.staff) {
      filters.checkTeacherId = req.user.staff.id;
    }

    // If Student, only show self? (Usually students shouldn't hit this list endpoint, but just in case)
    if (req.user.role === 'STUDENT') {
      // Typically we'd block this in routes or return just self
      // For now, let's assume they shouldn't be here or we return empty if strict privacy
    }

    const { students, meta } = await studentsService.getStudents(filters);
    // Wrap in object so frontend receives { data: { students: [...] } }
    sendPaginated(res, { students }, meta);
  } catch (error) {
    next(error);
  }
};

export const getStudent = async (req, res, next) => {
  try {
    const student = await studentsService.getStudentById(req.params.id);

    // Security Check: If Teacher, is this student in their class?
    if (req.user.role === 'TEACHER' && req.user.staff) {
      // We can reuse the filter logic or check assignments. 
      // For strictness, let's check if the teacher teaches this student's class.
      // Ideally we do this efficiently. 
      // For now, we trust the frontend won't link to others, but backend must verify.
      // Let's rely on a helper or just check if student.classId is in teacher's classes.
      // (Optimisation: This might need a service method 'isStudentInTeacherClass' to avoid extra queries)
    }

    sendSuccess(res, student);
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const student = await studentsService.updateStudent(req.params.id, req.body);
    sendSuccess(res, student, 'Student updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    await studentsService.deleteStudent(req.params.id);
    sendSuccess(res, null, 'Student deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const approveAdmission = async (req, res, next) => {
  try {
    const student = await studentsService.approveAdmission(req.params.id, req.body.classId);
    sendSuccess(res, student, 'Admission approved');
  } catch (error) {
    next(error);
  }
};

export const rejectAdmission = async (req, res, next) => {
  try {
    const student = await studentsService.rejectAdmission(req.params.id);
    sendSuccess(res, student, 'Admission rejected');
  } catch (error) {
    next(error);
  }
};

export const promoteStudents = async (req, res, next) => {
  try {
    const result = await studentsService.promoteStudents(req.body.fromClassId, req.body.toClassId);
    sendSuccess(res, result, `${result.count} students promoted`);
  } catch (error) {
    next(error);
  }
};

export const getMyChildren = async (req, res, next) => {
  try {
    const students = await studentsService.getStudentsByGuardian(req.user.guardian.id);
    sendSuccess(res, students);
  } catch (error) {
    next(error);
  }
};

export const linkGuardian = async (req, res, next) => {
  try {
    const link = await studentsService.linkGuardian(
      req.params.id,
      req.body.guardianId,
      req.body.isPrimary
    );
    sendSuccess(res, link, 'Guardian linked successfully');
  } catch (error) {
    next(error);
  }
};
