import * as attendanceService from './attendance.service.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';

export const markAttendance = async (req, res, next) => {
  try {
    const attendance = await attendanceService.markAttendance(req.body);
    sendSuccess(res, attendance, 'Attendance marked');
  } catch (error) {
    next(error);
  }
};

export const markBulkAttendance = async (req, res, next) => {
  try {
    const { classId, termId, date, records } = req.body;
    const results = await attendanceService.markBulkAttendance(classId, termId, date, records);
    sendSuccess(res, results, `Marked attendance for ${results.length} students`);
  } catch (error) {
    next(error);
  }
};

export const getClassAttendance = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;
    const attendance = await attendanceService.getClassAttendance(classId, date);
    sendSuccess(res, attendance);
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendance = async (req, res, next) => {
  try {
    const { attendances, meta } = await attendanceService.getStudentAttendance(
      req.params.studentId,
      req.query
    );
    sendPaginated(res, attendances, meta);
  } catch (error) {
    next(error);
  }
};

export const getStudentStats = async (req, res, next) => {
  try {
    const stats = await attendanceService.getAttendanceStats(
      req.params.studentId,
      req.query.termId
    );
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

export const getClassReport = async (req, res, next) => {
  try {
    const report = await attendanceService.getClassAttendanceReport(
      req.params.classId,
      req.query.termId
    );
    sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
};

export const getMyStats = async (req, res, next) => {
  try {
    const student = req.user.student;
    if (!student) {
      throw new Error('Student profile not found');
    }
    const stats = await attendanceService.getAttendanceStats(student.id, req.query.termId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};
