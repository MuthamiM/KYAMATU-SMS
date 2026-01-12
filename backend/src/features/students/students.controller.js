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
    const { students, meta } = await studentsService.getStudents(req.query);
    sendPaginated(res, students, meta);
  } catch (error) {
    next(error);
  }
};

export const getStudent = async (req, res, next) => {
  try {
    const student = await studentsService.getStudentById(req.params.id);
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
