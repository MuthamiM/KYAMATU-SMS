import * as timetableService from './timetable.service.js';
import { sendSuccess } from '../../utils/response.js';

export const getTimetable = async (req, res, next) => {
  try {
    const { classId } = req.query;
    if (!classId) throw new Error('classId is required');
    const timetable = await timetableService.getTimetable(classId);
    sendSuccess(res, timetable);
  } catch (error) {
    next(error);
  }
};

export const getTeacherTimetable = async (req, res, next) => {
  try {
    const staffId = req.params.staffId;
    if (!staffId) throw new Error('Staff ID required');

    const timetable = await timetableService.getTeacherTimetable(staffId);
    sendSuccess(res, timetable);
  } catch (error) {
    next(error);
  }
};

export const getMyTimetable = async (req, res, next) => {
  try {
    const staffId = req.user.staff?.id;
    if (!staffId) throw new Error('Staff profile not found');
    const timetable = await timetableService.getTeacherTimetable(staffId);
    sendSuccess(res, timetable);
  } catch (error) {
    next(error);
  }
};

export const getMyClassTimetable = async (req, res, next) => {
  try {
    const student = req.user.student;
    if (!student || !student.classId) {
      throw new Error('Student class not found');
    }
    const timetable = await timetableService.getTimetable(student.classId);
    sendSuccess(res, timetable);
  } catch (error) {
    next(error);
  }
};

export const upsertSlot = async (req, res, next) => {
  try {
    const slot = await timetableService.upsertTimetableSlot(req.body);
    sendSuccess(res, slot, 'Timetable slot saved');
  } catch (error) {
    next(error);
  }
};

export const generate = async (req, res, next) => {
  try {
    const result = await timetableService.generateTimetable();
    sendSuccess(res, result, 'Timetable generated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteSlot = async (req, res, next) => {
  try {
    await timetableService.deleteTimetableSlot(req.params.id);
    sendSuccess(res, null, 'Slot deleted');
  } catch (error) {
    next(error);
  }
};

export const getMasterTimetable = async (req, res, next) => {
  try {
    const timetable = await timetableService.getMasterTimetable();
    sendSuccess(res, timetable);
  } catch (error) {
    next(error);
  }
};

export const getNextLesson = async (req, res, next) => {
  try {
    const teacherId = req.user.staff?.id;
    if (!teacherId) throw new Error('Teacher profile not found');
    const lesson = await timetableService.getNextLesson(teacherId);
    sendSuccess(res, lesson);
  } catch (error) {
    next(error);
  }
};
