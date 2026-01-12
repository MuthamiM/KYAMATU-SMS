import * as academicService from './academic.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response.js';

export const createAcademicYear = async (req, res, next) => {
  try {
    const year = await academicService.createAcademicYear(req.body);
    sendCreated(res, year, 'Academic year created');
  } catch (error) {
    next(error);
  }
};

export const getAcademicYears = async (req, res, next) => {
  try {
    const years = await academicService.getAcademicYears();
    sendSuccess(res, years);
  } catch (error) {
    next(error);
  }
};

export const getCurrentYear = async (req, res, next) => {
  try {
    const year = await academicService.getCurrentAcademicYear();
    sendSuccess(res, year);
  } catch (error) {
    next(error);
  }
};

export const setCurrentYear = async (req, res, next) => {
  try {
    const year = await academicService.setCurrentYear(req.params.id);
    sendSuccess(res, year, 'Current year updated');
  } catch (error) {
    next(error);
  }
};

export const createTerm = async (req, res, next) => {
  try {
    const term = await academicService.createTerm(req.body);
    sendCreated(res, term, 'Term created');
  } catch (error) {
    next(error);
  }
};

export const getTerms = async (req, res, next) => {
  try {
    const terms = await academicService.getTerms(req.query.academicYearId);
    sendSuccess(res, terms);
  } catch (error) {
    next(error);
  }
};

export const createGrade = async (req, res, next) => {
  try {
    const grade = await academicService.createGrade(req.body);
    sendCreated(res, grade, 'Grade created');
  } catch (error) {
    next(error);
  }
};

export const getGrades = async (req, res, next) => {
  try {
    const grades = await academicService.getGrades();
    sendSuccess(res, grades);
  } catch (error) {
    next(error);
  }
};

export const createStream = async (req, res, next) => {
  try {
    const stream = await academicService.createStream(req.body);
    sendCreated(res, stream, 'Stream created');
  } catch (error) {
    next(error);
  }
};

export const getStreams = async (req, res, next) => {
  try {
    const streams = await academicService.getStreams();
    sendSuccess(res, streams);
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const classRecord = await academicService.createClass(req.body);
    sendCreated(res, classRecord, 'Class created');
  } catch (error) {
    next(error);
  }
};

export const getClasses = async (req, res, next) => {
  try {
    const { classes, meta } = await academicService.getClasses(req.query);
    sendPaginated(res, classes, meta);
  } catch (error) {
    next(error);
  }
};

export const getClass = async (req, res, next) => {
  try {
    const classRecord = await academicService.getClassById(req.params.id);
    sendSuccess(res, classRecord);
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const subject = await academicService.createSubject(req.body);
    sendCreated(res, subject, 'Subject created');
  } catch (error) {
    next(error);
  }
};

export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await academicService.getSubjects(req.query.gradeId);
    sendSuccess(res, subjects);
  } catch (error) {
    next(error);
  }
};

export const assignSubject = async (req, res, next) => {
  try {
    const assignment = await academicService.assignSubjectToClass(req.params.classId, req.body.subjectId);
    sendSuccess(res, assignment, 'Subject assigned to class');
  } catch (error) {
    next(error);
  }
};

export const removeSubject = async (req, res, next) => {
  try {
    await academicService.removeSubjectFromClass(req.params.classId, req.params.subjectId);
    sendSuccess(res, null, 'Subject removed from class');
  } catch (error) {
    next(error);
  }
};
