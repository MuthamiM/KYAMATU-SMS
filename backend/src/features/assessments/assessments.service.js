import prisma from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';
import { calculateGrade, mapCBCRating, paginationMeta } from '../../utils/helpers.js';

export const createAssessment = async (data) => {
  const assessmentData = { ...data };
  if (assessmentData.date) {
    assessmentData.date = new Date(assessmentData.date);
  }

  const assessment = await prisma.assessment.create({
    data: assessmentData,
    include: {
      subject: true,
      term: true,
    },
  });
  return assessment;
};

export const getAssessments = async (filters = {}, user) => {
  const { termId, subjectId, type, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (termId) where.termId = termId;
  if (subjectId) where.subjectId = subjectId;
  if (type) where.type = type;

  // If student is requesting, they should see assessments for their class grade
  if (user?.role === 'STUDENT') {
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      include: { class: true }
    });
    if (student && student.class) {
      where.subject = {
        gradeId: student.class.gradeId
      };
    }
  }

  const [assessments, total] = await Promise.all([
    prisma.assessment.findMany({
      where,
      skip,
      take: limit,
      include: {
        subject: true,
        term: { include: { academicYear: true } },
        _count: { select: { scores: true } },
      },
      orderBy: { date: 'desc' },
    }),
    prisma.assessment.count({ where }),
  ]);

  return { assessments, meta: paginationMeta(total, page, limit) };
};

export const getAssessmentById = async (id, user) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      subject: true,
      term: true,
      scores: {
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, admissionNumber: true },
          },
        },
      },
    },
  });

  if (!assessment) {
    throw new NotFoundError('Assessment');
  }

  // Privacy: If student, filter scores to only include their own
  if (user?.role === 'STUDENT') {
    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    if (student) {
      assessment.scores = assessment.scores.filter(s => s.studentId === student.id);
    } else {
      assessment.scores = [];
    }
  }

  return assessment;
};

export const enterScore = async (data) => {
  const { studentId, assessmentId, score } = data;

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
  });

  if (!assessment) {
    throw new NotFoundError('Assessment');
  }

  const percentage = (score / assessment.maxScore) * 100;
  const gradeInfo = calculateGrade(percentage);

  const assessmentScore = await prisma.assessmentScore.upsert({
    where: {
      studentId_assessmentId: { studentId, assessmentId },
    },
    update: { score, grade: gradeInfo.grade, comment: data.comment },
    create: {
      studentId,
      assessmentId,
      score,
      grade: gradeInfo.grade,
      comment: data.comment,
    },
    include: {
      student: { select: { firstName: true, lastName: true } },
      assessment: { select: { name: true, maxScore: true } },
    },
  });

  return assessmentScore;
};

export const enterBulkScores = async (assessmentId, scores) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
  });

  if (!assessment) {
    throw new NotFoundError('Assessment');
  }

  const results = await Promise.all(
    scores.map(async s => {
      const percentage = (s.score / assessment.maxScore) * 100;
      const gradeInfo = calculateGrade(percentage);

      return prisma.assessmentScore.upsert({
        where: {
          studentId_assessmentId: { studentId: s.studentId, assessmentId },
        },
        update: { score: s.score, grade: gradeInfo.grade, comment: s.comment },
        create: {
          studentId: s.studentId,
          assessmentId,
          score: s.score,
          grade: gradeInfo.grade,
          comment: s.comment,
        },
      });
    })
  );

  return results;
};

export const getStudentScores = async (studentId, filters = {}) => {
  const { termId, subjectId } = filters;

  const where = { studentId };
  if (termId || subjectId) {
    where.assessment = {};
    if (termId) where.assessment.termId = termId;
    if (subjectId) where.assessment.subjectId = subjectId;
  }

  const scores = await prisma.assessmentScore.findMany({
    where,
    include: {
      assessment: {
        include: {
          subject: true,
          term: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return scores;
};

export const getStudentPerformanceSummary = async (studentId, termId) => {
  const scores = await prisma.assessmentScore.findMany({
    where: {
      studentId,
      assessment: { termId },
    },
    include: {
      assessment: {
        include: { subject: true },
      },
    },
  });

  const subjectScores = {};

  for (const s of scores) {
    const subjectId = s.assessment.subjectId;
    const subjectName = s.assessment.subject.name;

    if (!subjectScores[subjectId]) {
      subjectScores[subjectId] = {
        subjectId,
        subjectName,
        scores: [],
        totalWeight: 0,
        weightedSum: 0,
      };
    }

    const percentage = (s.score / s.assessment.maxScore) * 100;
    subjectScores[subjectId].scores.push({
      assessmentName: s.assessment.name,
      score: s.score,
      maxScore: s.assessment.maxScore,
      percentage,
      weight: s.assessment.weight,
    });

    subjectScores[subjectId].weightedSum += percentage * s.assessment.weight;
    subjectScores[subjectId].totalWeight += s.assessment.weight;
  }

  const summary = Object.values(subjectScores).map(subject => {
    const average = subject.totalWeight > 0
      ? subject.weightedSum / subject.totalWeight
      : 0;
    const gradeInfo = calculateGrade(average);
    const cbcRating = mapCBCRating(average);

    return {
      ...subject,
      average: average.toFixed(2),
      grade: gradeInfo.grade,
      remark: gradeInfo.remark,
      cbcRating,
    };
  });

  const overallAverage = summary.length > 0
    ? summary.reduce((sum, s) => sum + parseFloat(s.average), 0) / summary.length
    : 0;

  return {
    subjects: summary,
    overallAverage: overallAverage.toFixed(2),
    overallGrade: calculateGrade(overallAverage).grade,
  };
};

export const getStudentTermPerformance = async (studentId) => {
  // Find the current academic year
  const currentYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
    include: {
      terms: { orderBy: { termNumber: 'asc' } },
    },
  });

  if (!currentYear) {
    return { academicYear: null, terms: [] };
  }

  // Fetch all scores for this student in the current academic year's terms
  const termIds = currentYear.terms.map(t => t.id);

  const allScores = await prisma.assessmentScore.findMany({
    where: {
      studentId,
      assessment: { termId: { in: termIds } },
    },
    include: {
      assessment: {
        include: { subject: true, term: true },
      },
    },
  });

  // Group scores by term, then by subject
  const terms = currentYear.terms.map(term => {
    const termScores = allScores.filter(s => s.assessment.termId === term.id);
    const subjectMap = {};

    for (const s of termScores) {
      const subjectId = s.assessment.subjectId;
      const subjectName = s.assessment.subject.name;

      if (!subjectMap[subjectId]) {
        subjectMap[subjectId] = {
          subjectId,
          subjectName,
          assessments: [],
          weightedSum: 0,
          totalWeight: 0,
        };
      }

      const percentage = (s.score / s.assessment.maxScore) * 100;
      subjectMap[subjectId].assessments.push({
        name: s.assessment.name,
        type: s.assessment.type,
        score: s.score,
        maxScore: s.assessment.maxScore,
        percentage: percentage.toFixed(2),
        weight: s.assessment.weight,
      });

      subjectMap[subjectId].weightedSum += percentage * s.assessment.weight;
      subjectMap[subjectId].totalWeight += s.assessment.weight;
    }

    const subjects = Object.values(subjectMap).map(sub => {
      const average = sub.totalWeight > 0 ? sub.weightedSum / sub.totalWeight : 0;
      const gradeInfo = calculateGrade(average);
      return {
        subjectId: sub.subjectId,
        subjectName: sub.subjectName,
        assessments: sub.assessments,
        average: average.toFixed(2),
        grade: gradeInfo.grade,
        remark: gradeInfo.remark,
      };
    });

    const termAverage = subjects.length > 0
      ? subjects.reduce((sum, s) => sum + parseFloat(s.average), 0) / subjects.length
      : 0;

    return {
      termId: term.id,
      termName: term.name,
      termNumber: term.termNumber,
      subjects,
      termAverage: termAverage.toFixed(2),
      termGrade: calculateGrade(termAverage).grade,
      termRemark: calculateGrade(termAverage).remark
    };
  });

  return {
    academicYear: currentYear.name,
    terms,
  };
};

export const createCompetency = async (data) => {
  const competency = await prisma.competency.create({
    data,
    include: { subject: true },
  });
  return competency;
};

export const getCompetencies = async (subjectId) => {
  const where = subjectId ? { subjectId } : {};
  const competencies = await prisma.competency.findMany({
    where,
    include: { subject: true },
  });
  return competencies;
};

export const rateCompetency = async (studentId, competencyId, rating) => {
  const score = await prisma.competencyScore.upsert({
    where: {
      studentId_competencyId: { studentId, competencyId },
    },
    update: { rating },
    create: { studentId, competencyId, rating },
    include: {
      competency: { include: { subject: true } },
    },
  });
  return score;
};

export const getStudentCompetencies = async (studentId, subjectId) => {
  const where = { studentId };
  if (subjectId) {
    where.competency = { subjectId };
  }

  const scores = await prisma.competencyScore.findMany({
    where,
    include: {
      competency: { include: { subject: true } },
    },
  });

  return scores;
};
