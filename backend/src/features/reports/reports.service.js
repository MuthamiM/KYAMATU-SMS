import prisma from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';
import { calculateGrade, mapCBCRating } from '../../utils/helpers.js';

const calculateClassStatistics = async (classId, termId) => {
  const students = await prisma.student.findMany({
    where: { classId },
    select: { id: true },
  });

  const studentIds = students.map(s => s.id);

  const allScores = await prisma.assessmentScore.findMany({
    where: {
      studentId: { in: studentIds },
      assessment: { termId },
    },
    include: {
      assessment: { include: { subject: true } },
    },
  });

  const studentAverages = new Map();
  const subjectStats = new Map();

  for (const score of allScores) {
    const percentage = (score.score / score.assessment.maxScore) * 100;
    const subjectId = score.assessment.subjectId;
    const subjectName = score.assessment.subject.name;

    if (!studentAverages.has(score.studentId)) {
      studentAverages.set(score.studentId, { total: 0, count: 0, subjects: new Map() });
    }

    const studentData = studentAverages.get(score.studentId);

    if (!studentData.subjects.has(subjectId)) {
      studentData.subjects.set(subjectId, { total: 0, count: 0, weight: 0 });
    }

    const subjectData = studentData.subjects.get(subjectId);
    subjectData.total += percentage * score.assessment.weight;
    subjectData.weight += score.assessment.weight;
    subjectData.count++;

    if (!subjectStats.has(subjectId)) {
      subjectStats.set(subjectId, { name: subjectName, scores: [] });
    }
  }

  const rankings = [];

  for (const [studentId, data] of studentAverages) {
    let totalAverage = 0;
    let subjectCount = 0;

    for (const [subjectId, subjectData] of data.subjects) {
      if (subjectData.weight > 0) {
        const subjectAvg = subjectData.total / subjectData.weight;
        totalAverage += subjectAvg;
        subjectCount++;

        const stats = subjectStats.get(subjectId);
        if (stats) {
          stats.scores.push(subjectAvg);
        }
      }
    }

    const overallAverage = subjectCount > 0 ? totalAverage / subjectCount : 0;
    rankings.push({ studentId, average: overallAverage, subjectCount });
  }

  rankings.sort((a, b) => b.average - a.average);

  let currentRank = 0;
  let previousAverage = null;
  const rankedStudents = rankings.map((r, index) => {
    if (previousAverage !== r.average) {
      currentRank = index + 1;
    }
    previousAverage = r.average;
    return { ...r, rank: currentRank };
  });

  const classTotal = rankings.reduce((sum, r) => sum + r.average, 0);
  const classMean = rankings.length > 0 ? classTotal / rankings.length : 0;

  const subjectMeans = [];
  for (const [subjectId, stats] of subjectStats) {
    const mean = stats.scores.length > 0
      ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length
      : 0;
    const highest = stats.scores.length > 0 ? Math.max(...stats.scores) : 0;
    const lowest = stats.scores.length > 0 ? Math.min(...stats.scores) : 0;

    subjectMeans.push({
      subjectId,
      subjectName: stats.name,
      mean: mean.toFixed(2),
      highest: highest.toFixed(2),
      lowest: lowest.toFixed(2),
      entryCount: stats.scores.length,
    });
  }

  return {
    classMean: classMean.toFixed(2),
    totalStudents: rankings.length,
    rankings: rankedStudents,
    subjectMeans,
  };
};

export const generateReportCard = async (studentId, termId) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: {
        include: { grade: true, stream: true, academicYear: true },
      },
      user: { select: { email: true } },
    },
  });

  if (!student) {
    throw new NotFoundError('Student');
  }

  const term = await prisma.term.findUnique({
    where: { id: termId },
    include: { academicYear: true },
  });

  if (!term) {
    throw new NotFoundError('Term');
  }

  const scores = await prisma.assessmentScore.findMany({
    where: {
      studentId,
      assessment: { termId },
    },
    include: {
      assessment: { include: { subject: true } },
    },
  });

  const classStats = await calculateClassStatistics(student.classId, termId);

  const studentRankInfo = classStats.rankings.find(r => r.studentId === studentId);

  const subjectResults = new Map();

  for (const score of scores) {
    const subjectId = score.assessment.subjectId;
    const subjectName = score.assessment.subject.name;

    if (!subjectResults.has(subjectId)) {
      subjectResults.set(subjectId, {
        subjectId,
        subjectName,
        assessments: [],
        totalWeighted: 0,
        totalWeight: 0,
      });
    }

    const subject = subjectResults.get(subjectId);
    const percentage = (score.score / score.assessment.maxScore) * 100;

    subject.assessments.push({
      name: score.assessment.name,
      score: score.score,
      maxScore: score.assessment.maxScore,
      percentage: percentage.toFixed(2),
      weight: score.assessment.weight,
    });

    subject.totalWeighted += percentage * score.assessment.weight;
    subject.totalWeight += score.assessment.weight;
  }

  const subjects = Array.from(subjectResults.values()).map(subject => {
    const average = subject.totalWeight > 0 ? subject.totalWeighted / subject.totalWeight : 0;
    const gradeInfo = calculateGrade(average);
    const cbcRating = mapCBCRating(average);

    const subjectMean = classStats.subjectMeans.find(s => s.subjectId === subject.subjectId);

    return {
      subjectName: subject.subjectName,
      assessments: subject.assessments,
      average: average.toFixed(2),
      grade: gradeInfo.grade,
      remark: gradeInfo.remark,
      cbcRating,
      classMean: subjectMean?.mean || '0',
      classHighest: subjectMean?.highest || '0',
      classLowest: subjectMean?.lowest || '0',
    };
  });

  const totalScore = subjects.reduce((sum, s) => sum + parseFloat(s.average), 0);
  const averageScore = subjects.length > 0 ? totalScore / subjects.length : 0;

  const competencies = await prisma.competencyScore.findMany({
    where: { studentId },
    include: {
      competency: { include: { subject: true } },
    },
  });

  const attendance = await prisma.attendance.findMany({
    where: { studentId, termId },
  });

  const attendanceStats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'PRESENT').length,
    absent: attendance.filter(a => a.status === 'ABSENT').length,
    late: attendance.filter(a => a.status === 'LATE').length,
  };

  const reportCard = await prisma.reportCard.upsert({
    where: {
      studentId_termId: { studentId, termId },
    },
    update: {
      totalScore: totalScore,
      averageScore: averageScore,
      rank: studentRankInfo?.rank || null,
      generatedAt: new Date(),
    },
    create: {
      studentId,
      termId,
      totalScore: totalScore,
      averageScore: averageScore,
      rank: studentRankInfo?.rank || null,
    },
  });

  return {
    id: reportCard.id,
    student: {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      class: `${student.class.grade.name} ${student.class.stream.name}`,
      academicYear: student.class.academicYear.name,
    },
    term: {
      id: term.id,
      name: term.name,
      academicYear: term.academicYear.name,
    },
    subjects,
    summary: {
      totalScore: totalScore.toFixed(2),
      averageScore: averageScore.toFixed(2),
      overallGrade: calculateGrade(averageScore).grade,
      overallRemark: calculateGrade(averageScore).remark,
      rank: studentRankInfo?.rank || null,
      outOf: classStats.totalStudents,
      classMean: classStats.classMean,
    },
    competencies: competencies.map(c => ({
      subject: c.competency.subject.name,
      competency: c.competency.name,
      rating: c.rating,
    })),
    attendance: attendanceStats,
    teacherComment: reportCard.teacherComment,
    principalComment: reportCard.principalComment,
    generatedAt: reportCard.generatedAt,
  };
};

export const generateClassReportCards = async (classId, termId) => {
  const students = await prisma.student.findMany({
    where: { classId },
    select: { id: true },
  });

  const reports = await Promise.all(
    students.map(s => generateReportCard(s.id, termId))
  );

  return reports;
};

export const updateReportComments = async (reportCardId, data) => {
  const reportCard = await prisma.reportCard.update({
    where: { id: reportCardId },
    data: {
      teacherComment: data.teacherComment,
      principalComment: data.principalComment,
    },
  });

  return reportCard;
};

export const getClassRankings = async (classId, termId) => {
  const stats = await calculateClassStatistics(classId, termId);

  const students = await prisma.student.findMany({
    where: { classId },
    select: { id: true, firstName: true, lastName: true, admissionNumber: true },
  });

  const studentMap = new Map(students.map(s => [s.id, s]));

  const rankings = stats.rankings.map(r => ({
    rank: r.rank,
    student: studentMap.get(r.studentId),
    average: r.average.toFixed(2),
    grade: calculateGrade(r.average).grade,
  }));

  return {
    classMean: stats.classMean,
    totalStudents: stats.totalStudents,
    subjectMeans: stats.subjectMeans,
    rankings,
  };
};

export const getSubjectAnalysis = async (classId, termId, subjectId) => {
  const students = await prisma.student.findMany({
    where: { classId },
    include: {
      assessmentScores: {
        where: {
          assessment: { termId, subjectId },
        },
        include: {
          assessment: true,
        },
      },
    },
  });

  const analysis = students.map(student => {
    const scores = student.assessmentScores;
    let totalWeighted = 0;
    let totalWeight = 0;

    for (const score of scores) {
      const percentage = (score.score / score.assessment.maxScore) * 100;
      totalWeighted += percentage * score.assessment.weight;
      totalWeight += score.assessment.weight;
    }

    const average = totalWeight > 0 ? totalWeighted / totalWeight : 0;

    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      average: average.toFixed(2),
      grade: calculateGrade(average).grade,
      cbcRating: mapCBCRating(average),
    };
  });

  analysis.sort((a, b) => parseFloat(b.average) - parseFloat(a.average));

  let rank = 0;
  let prevAvg = null;
  const rankedAnalysis = analysis.map((a, idx) => {
    if (prevAvg !== a.average) {
      rank = idx + 1;
    }
    prevAvg = a.average;
    return { ...a, rank };
  });

  const averages = analysis.map(a => parseFloat(a.average));
  const mean = averages.length > 0 ? averages.reduce((a, b) => a + b, 0) / averages.length : 0;

  return {
    subjectMean: mean.toFixed(2),
    highest: averages.length > 0 ? Math.max(...averages).toFixed(2) : 0,
    lowest: averages.length > 0 ? Math.min(...averages).toFixed(2) : 0,
    totalStudents: analysis.length,
    students: rankedAnalysis,
  };
};

export const getReportCards = async (filters = {}) => {
  const { termId, classId } = filters;

  const where = {};
  if (termId) where.termId = termId;
  if (classId) where.student = { classId };

  const reports = await prisma.reportCard.findMany({
    where,
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          admissionNumber: true,
          class: { include: { grade: true, stream: true } },
        },
      },
      term: true,
    },
    orderBy: { rank: 'asc' },
  });

  return reports;
};
