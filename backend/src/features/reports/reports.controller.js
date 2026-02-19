import * as reportsService from './reports.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';

export const generateReportCard = async (req, res, next) => {
  try {
    const { studentId, termId } = req.body;

    // Security: Student can only generate their own report
    if (req.user.role === 'STUDENT' && req.user.student.id !== studentId) {
      throw new Error('You can only generate your own report card');
    }

    const report = await reportsService.generateReportCard(studentId, termId);
    sendCreated(res, report, 'Report card generated');
  } catch (error) {
    next(error);
  }
};

export const generateClassReports = async (req, res, next) => {
  try {
    const { classId, termId } = req.body;
    const reports = await reportsService.generateClassReportCards(classId, termId);
    sendCreated(res, reports, `Generated ${reports.length} report cards`);
  } catch (error) {
    next(error);
  }
};

export const getReportCards = async (req, res, next) => {
  try {
    const filters = { ...req.query };

    // If user is a student, force the studentId filter
    if (req.user.role === 'STUDENT') {
      filters.studentId = req.user.student.id;
    }

    const reports = await reportsService.getReportCards(filters);
    sendSuccess(res, reports);
  } catch (error) {
    next(error);
  }
};

export const updateComments = async (req, res, next) => {
  try {
    const report = await reportsService.updateReportComments(req.params.id, req.body);
    sendSuccess(res, report, 'Comments updated');
  } catch (error) {
    next(error);
  }
};

export const getClassRankings = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { termId } = req.query;
    const rankings = await reportsService.getClassRankings(classId, termId);
    sendSuccess(res, rankings);
  } catch (error) {
    next(error);
  }
};

export const getSubjectAnalysis = async (req, res, next) => {
  try {
    const { classId, subjectId } = req.params;
    const { termId } = req.query;
    const analysis = await reportsService.getSubjectAnalysis(classId, termId, subjectId);
    sendSuccess(res, analysis);
  } catch (error) {
    next(error);
  }
};
