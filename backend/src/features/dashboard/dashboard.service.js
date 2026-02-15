import prisma from '../../config/database.js';

export const getSummaryStats = async () => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(`${currentYear}-01-01`);
  const endOfYear = new Date(`${currentYear}-12-31`);

  // Fee Summary
  const feeStats = await prisma.studentInvoice.aggregate({
    _sum: {
      totalAmount: true,
      paidAmount: true,
      balance: true,
    }
  });

  // Student Admissions (This Year)
  const totalAdmissions = await prisma.student.count({
    where: {
      admissionDate: {
        gte: startOfYear,
        lte: endOfYear
      }
    }
  });

  const pendingAdmissions = await prisma.student.count({
    where: {
      admissionStatus: 'PENDING'
    }
  });

  const rejectedAdmissions = await prisma.student.count({
    where: {
      admissionStatus: 'REJECTED'
    }
  });

  // Staff Summary
  const teachingStaff = await prisma.user.count({ where: { role: 'TEACHER' } });
  const nonTeachingStaff = await prisma.user.count({ where: { role: 'BURSAR' } }); // Simplified for now

  // Attendance (Today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendanceStats = await prisma.attendance.groupBy({
    by: ['status'],
    where: {
      date: {
        gte: today
      }
    },
    _count: true
  });

  // Institute Summary
  const totalClasses = await prisma.class.count();
  const totalStreams = await prisma.stream.count(); // Approximate 'sections'

  return {
    fees: {
      total: feeStats._sum.totalAmount || 0,
      collected: feeStats._sum.paidAmount || 0,
      pending: feeStats._sum.balance || 0
    },
    students: {
      applied: totalAdmissions,
      pending: pendingAdmissions,
      rejected: rejectedAdmissions,
      total: await prisma.student.count()
    },
    staff: {
      teaching: teachingStaff,
      nonTeaching: nonTeachingStaff
    },
    institute: {
      classes: totalClasses,
      sections: totalStreams
    }
  };
};

export const getStudentGrowth = async () => {
  // Get counts grouped by admission year for the last 4 years
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

  const growthData = [];

  for (const year of years) {
    const count = await prisma.student.count({
      where: {
        admissionDate: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`)
        }
      }
    });
    // This logic counts NEW admissions per year. 
    // To get TOTAL students active in that year, we'd need more complex logic (admitted before end of year AND not left).
    // For simplicity in this iteration, we'll assume cumulative growth or just admissions.
    // Let's do cumulative active students (approximate by all admitted <= year)
    const cumulative = await prisma.student.count({
      where: {
        admissionDate: {
          lte: new Date(`${year}-12-31`)
        }
      }
    });

    growthData.push({ year: year.toString(), count: cumulative });
  }

  return growthData;
};

export const getFeeCollectionTrends = async () => {
  // Monthly collection for current year
  const year = new Date().getFullYear();
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year}-12-31`);

  const payments = await prisma.payment.findMany({
    where: {
      paidAt: {
        gte: startOfYear,
        lte: endOfYear
      },
      status: 'COMPLETED'
    },
    select: {
      amount: true,
      paidAt: true
    }
  });

  // Group by Month
  const monthlyData = new Array(12).fill(0);
  payments.forEach(p => {
    const month = new Date(p.paidAt).getMonth();
    monthlyData[month] += p.amount;
  });

  return monthlyData.map((amount, index) => ({
    month: new Date(0, index).toLocaleString('default', { month: 'short' }),
    amount
  }));
};

export const getAttendanceDistribution = async () => {
  // Overall attendance stats for pie chart
  const present = await prisma.attendance.count({ where: { status: 'PRESENT' } });
  const absent = await prisma.attendance.count({ where: { status: 'ABSENT' } });

  // Calculate percentages
  const total = present + absent || 1;
  return [
    { name: 'Present', value: parseFloat(((present / total) * 100).toFixed(2)) },
    { name: 'Absent', value: parseFloat(((absent / total) * 100).toFixed(2)) }
  ];
};

export const getStudentDashboardData = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      class: {
        include: {
          classSubjects: {
            include: {
              subject: true
            }
          }
        }
      }
    }
  });

  if (!student) throw new Error('Student profile not found');

  const term = await prisma.term.findFirst({
    where: { academicYear: { isCurrent: true } },
    orderBy: { startDate: 'desc' }
  });

  // 1. Timetable Slots
  const timetable = await prisma.timetableSlot.findMany({
    where: { classId: student.classId },
    include: {
      subject: true,
      teacher: {
        select: { firstName: true, lastName: true }
      }
    }
  });

  // 2. Exam Scores (Audit)
  const scores = await prisma.assessmentScore.findMany({
    where: { studentId: student.id },
    include: {
      assessment: {
        include: { subject: true }
      }
    },
    orderBy: { assessment: { date: 'desc' } }
  });

  // 3. Fee Info
  const invoice = await prisma.studentInvoice.findFirst({
    where: { studentId: student.id, termId: term?.id },
    orderBy: { createdAt: 'desc' }
  });

  // 4. Attendance Summary (This termite)
  const attendance = await prisma.attendance.groupBy({
    by: ['status'],
    where: { studentId: student.id, termId: term?.id },
    _count: true
  });

  // 5. Courses with Outlines
  const subjectsWithOutlines = await Promise.all(
    (student.class?.classSubjects || []).map(async (cs) => {
      const outline = await prisma.courseOutline.findUnique({
        where: {
          classId_subjectId_termId: {
            classId: student.classId,
            subjectId: cs.subjectId,
            termId: term?.id
          }
        }
      });
      return {
        ...cs.subject,
        hasOutline: !!outline,
        outlineId: outline?.id
      };
    })
  );

  return {
    student,
    timetable,
    scores: scores.map(s => ({
      id: s.id,
      subject: s.assessment.subject.name,
      assessmentName: s.assessment.name,
      score: s.score,
      grade: s.grade,
      date: s.assessment.date
    })),
    fees: {
      total: invoice?.totalAmount || 0,
      paid: invoice?.paidAmount || 0,
      balance: invoice?.balance || 0
    },
    attendance: attendance.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = curr._count;
      return acc;
    }, { present: 0, absent: 0, late: 0 }),
    courses: subjectsWithOutlines
  };
};

