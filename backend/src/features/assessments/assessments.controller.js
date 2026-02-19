import * as assessmentsService from './assessments.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response.js';

export const createAssessment = async (req, res, next) => {
  try {
    const assessment = await assessmentsService.createAssessment(req.body);
    sendCreated(res, assessment, 'Assessment created');
  } catch (error) {
    next(error);
  }
};

export const getAssessments = async (req, res, next) => {
  try {
    const { assessments, meta } = await assessmentsService.getAssessments(req.query, req.user);
    sendPaginated(res, assessments, meta);
  } catch (error) {
    next(error);
  }
};

export const getAssessment = async (req, res, next) => {
  try {
    const assessment = await assessmentsService.getAssessmentById(req.params.id, req.user);
    sendSuccess(res, assessment);
  } catch (error) {
    next(error);
  }
};

export const enterScore = async (req, res, next) => {
  try {
    const score = await assessmentsService.enterScore(req.body);
    sendSuccess(res, score, 'Score recorded');
  } catch (error) {
    next(error);
  }
};

export const enterBulkScores = async (req, res, next) => {
  try {
    const { assessmentId, scores } = req.body;
    const results = await assessmentsService.enterBulkScores(assessmentId, scores);
    sendSuccess(res, results, `Recorded ${results.length} scores`);
  } catch (error) {
    next(error);
  }
};

export const getStudentScores = async (req, res, next) => {
  try {
    const scores = await assessmentsService.getStudentScores(req.params.studentId, req.query);
    sendSuccess(res, scores);
  } catch (error) {
    next(error);
  }
};

export const getStudentSummary = async (req, res, next) => {
  try {
    const summary = await assessmentsService.getStudentPerformanceSummary(
      req.params.studentId,
      req.query.termId
    );
    sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};

export const createCompetency = async (req, res, next) => {
  try {
    const competency = await assessmentsService.createCompetency(req.body);
    sendCreated(res, competency, 'Competency created');
  } catch (error) {
    next(error);
  }
};

export const getCompetencies = async (req, res, next) => {
  try {
    const competencies = await assessmentsService.getCompetencies(req.query.subjectId);
    sendSuccess(res, competencies);
  } catch (error) {
    next(error);
  }
};

export const rateCompetency = async (req, res, next) => {
  try {
    const score = await assessmentsService.rateCompetency(
      req.body.studentId,
      req.body.competencyId,
      req.body.rating
    );
    sendSuccess(res, score, 'Competency rated');
  } catch (error) {
    next(error);
  }
};

export const getStudentCompetencies = async (req, res, next) => {
  try {
    const competencies = await assessmentsService.getStudentCompetencies(
      req.params.studentId,
      req.query.subjectId
    );
    sendSuccess(res, competencies);
  } catch (error) {
    next(error);
  }
};
