import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import config from './config/index.js';
import logger from './config/logger.js';
import { connectRedis, getRedisClient, clearRateLimit, clearAllRateLimits } from './config/redis.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import prisma from './config/database.js';
import { sanitizeInputs } from './middleware/sanitize.js';
import { requestId } from './middleware/requestId.js';
import { auditLog } from './middleware/auditLog.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

import authRoutes from './features/auth/auth.routes.js';
import studentsRoutes from './features/students/students.routes.js';
import staffRoutes from './features/staff/staff.routes.js';
import academicRoutes from './features/academic/academic.routes.js';
import attendanceRoutes from './features/attendance/attendance.routes.js';
import qrAttendanceRoutes from './features/attendance/qr.routes.js';
import assessmentsRoutes from './features/assessments/assessments.routes.js';
import reportsRoutes from './features/reports/reports.routes.js';
import feesRoutes from './features/fees/fees.routes.js';
import communicationRoutes from './features/communication/communication.routes.js';
import * as timetableService from './features/academic/timetable.service.js';
import timetableRoutes from './features/academic/timetable.routes.js';
import dashboardRoutes from './features/dashboard/dashboard.routes.js';
import aiRoutes from './features/ai/ai.routes.js';
import reminderRoutes from './features/reminders/reminder.routes.js';
import integrationsRoutes from './features/integrations/integrations.routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use('/public', express.static(path.join(__dirname, '../public')));
app.use(requestId);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin matches allowed production origin or is a preview deployment
    const allowedOrigin = config.cors.origin;
    if (
      origin === allowedOrigin ||
      origin.endsWith('.pages.dev') ||
      origin.endsWith('.mftechnologies.org') ||
      origin.startsWith('http://localhost') ||
      origin === 'https://matundu-sms-backend.onrender.com' ||
      origin === 'https://kyamatu-sms-backend.onrender.com'
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(sanitizeInputs);

// Initialize Redis and create rate limiters
const initializeApp = async () => {
  const redisClient = await connectRedis();

  // Create Redis store if available, otherwise use memory
  const createStore = (prefix) => {
    if (redisClient) {
      return new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: `rl:${prefix}:`,
      });
    }
    return undefined; // Falls back to memory store
  };

  const generalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore('general'),
    handler: (req, res) => {
      logger.warn({ requestId: req.id, ip: req.ip, path: req.path, message: 'Rate limit exceeded' });
      res.status(429).json({ success: false, message: 'Too many requests, please try again later' });
    },
  });

  const authLimiter = rateLimit({
    windowMs: config.authRateLimit.windowMs,
    max: config.authRateLimit.max,
    message: { success: false, message: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    store: createStore('auth'),
    handler: (req, res) => {
      logger.warn({ requestId: req.id, ip: req.ip, message: 'Auth rate limit exceeded' });
      res.status(429).json({ success: false, message: 'Too many login attempts, please try again later' });
    },
  });

  app.use('/api', generalLimiter);
  app.use('/api/auth', authLimiter);
};

// Initialize rate limiters
initializeApp().catch(err => {
  logger.error({ message: 'Failed to initialize app', error: err.message });
});

app.use(auditLog);

// Root routes for health checks and status
app.get('/', (req, res) => {
  res.json({
    message: 'MATUNDU-SMS API is running',
    version: '1.0.0',
    status: 'ok',
    env: config.env,
    requestId: req.id
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'MATUNDU-SMS API Base Endpoint',
    docs: '/api/docs', // if any
    health: '/api/health',
    status: 'ok',
    requestId: req.id
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', async (req, res) => {
  const start = Date.now();
  let dbStatus = 'disconnected';
  let dbLatency = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
    dbLatency = Date.now() - start;
  } catch (e) {
    dbStatus = 'disconnected';
  }

  const memory = process.memoryUsage();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestId: req.id,
    dbStatus,
    dbLatency,
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
    },
  });
});

// Admin seed endpoint - requires secret key
app.post('/api/admin/reseed', async (req, res) => {
  const { secretKey } = req.body;

  // Simple secret key check
  if (secretKey !== 'matundu-reseed-2026' && secretKey !== 'kyamatu-reseed-2026') {
    return res.status(403).json({ success: false, message: 'Invalid secret key' });
  }

  try {
    logger.info('Starting database reseed via API...');

    // Auto-patch missing columns on remote database if not yet migrated
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "sneStatus" TEXT DEFAULT 'NO'`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "upiNumber" TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "assessmentNumber" TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "medicalInfo" TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "prefectRole" TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "googleRefreshToken" TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "microsoftRefreshToken" TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "Class" ALTER COLUMN "streamId" DROP NOT NULL`);
    } catch (e) {
      logger.warn({ message: 'Schema patch note', error: e.message });
    }

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('Admin@123', 12);

    // Clean up
    await prisma.timetableSlot.deleteMany();
    await prisma.teacherAssignment.deleteMany(); // Moved to top
    await prisma.payment.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.studentInvoice.deleteMany();
    await prisma.feeStructure.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.assessmentScore.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.studentGuardian.deleteMany();
    await prisma.guardian.deleteMany();
    await prisma.classSubject.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.student.deleteMany();
    await prisma.class.deleteMany();
    await prisma.stream.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.term.deleteMany();
    await prisma.academicYear.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.user.deleteMany();
    logger.info('Cleaned up old data');

    // Academic Year
    const currentYear = await prisma.academicYear.create({
      data: { name: '2026', startDate: new Date('2026-01-05'), endDate: new Date('2026-11-30'), isCurrent: true }
    });

    // Terms
    const term1 = await prisma.term.create({
      data: { name: 'Term 1', termNumber: 1, startDate: new Date('2026-01-05'), endDate: new Date('2026-04-10'), academicYearId: currentYear.id }
    });
    await prisma.term.create({ data: { name: 'Term 2', termNumber: 2, startDate: new Date('2026-05-02'), endDate: new Date('2026-08-10'), academicYearId: currentYear.id } });
    await prisma.term.create({ data: { name: 'Term 3', termNumber: 3, startDate: new Date('2026-09-01'), endDate: new Date('2026-11-25'), academicYearId: currentYear.id } });

    // Grades
    const grades = [];
    for (let i = 1; i <= 9; i++) {
      const g = await prisma.grade.create({ data: { name: `Grade ${i}`, level: i } });
      grades.push(g);
    }

    // Classes & Official CBC Subjects per Grade
    const CBC_SUBJECTS_CONFIG = {
      lowerPrimary: [
        { name: 'Literacy Activities', code: 'LIT' },
        { name: 'Kiswahili Language Activities', code: 'KIS' },
        { name: 'English Language Activities', code: 'ENG' },
        { name: 'Mathematical Activities', code: 'MAT' },
        { name: 'Environmental Activities', code: 'ENV' },
        { name: 'Hygiene and Nutrition Activities', code: 'HYG' },
        { name: 'Religious Education (CRE)', code: 'CRE' },
        { name: 'Movement and Creative Activities', code: 'MCA' },
      ],
      upperPrimary: [
        { name: 'English', code: 'ENG' },
        { name: 'Kiswahili', code: 'KIS' },
        { name: 'Mathematics', code: 'MAT' },
        { name: 'Science and Technology', code: 'SCI' },
        { name: 'Agriculture', code: 'AGR' },
        { name: 'Home Science', code: 'HOM' },
        { name: 'Social Studies', code: 'SST' },
        { name: 'Religious Education (CRE)', code: 'CRE' },
        { name: 'Creative Arts', code: 'ART' },
        { name: 'Physical and Health Education (PHE)', code: 'PHE' },
      ],
      juniorSecondary: [
        { name: 'Mathematics', code: 'MAT' },
        { name: 'English', code: 'ENG' },
        { name: 'Kiswahili', code: 'KIS' },
        { name: 'Integrated Science', code: 'ISC' },
        { name: 'Agriculture and Nutrition', code: 'AGR' },
        { name: 'Pre-Technical Studies', code: 'PTS' },
        { name: 'Social Studies', code: 'SST' },
        { name: 'Religious Education (CRE)', code: 'CRE' },
        { name: 'Creative Arts and Sports', code: 'CAS' },
      ]
    };

    const classes = [];
    for (const grade of grades) {
      let subjectList = [];
      if (grade.level <= 3) {
        subjectList = CBC_SUBJECTS_CONFIG.lowerPrimary;
      } else if (grade.level <= 6) {
        subjectList = CBC_SUBJECTS_CONFIG.upperPrimary;
      } else {
        subjectList = CBC_SUBJECTS_CONFIG.juniorSecondary;
      }

      const gradeSubjects = [];
      for (const subj of subjectList) {
        const s = await prisma.subject.create({
          data: { name: subj.name, code: `${subj.code}${grade.level}`, gradeId: grade.id }
        });
        gradeSubjects.push(s);
      }

      const stream = await prisma.stream.create({ data: { name: 'A' } });
      const cls = await prisma.class.create({
        data: {
          name: `Grade ${grade.level}`,
          capacity: 40,
          gradeId: grade.id,
          streamId: stream.id,
          academicYearId: currentYear.id
        }
      });
      classes.push(cls);

      for (const subj of gradeSubjects) {
        await prisma.classSubject.create({ data: { classId: cls.id, subjectId: subj.id } });
      }
    }

    // 1. Admin Account
    const adminUser = await prisma.user.create({ data: { email: 'admin@matundu.ac.ke', password: hashedPassword, role: 'SUPER_ADMIN', phone: '+254700000001' } });
    await prisma.staff.create({ data: { userId: adminUser.id, employeeNumber: 'ADM-001', firstName: 'System', lastName: 'Administrator', gender: 'Male', qualification: 'System Administrator', specialization: 'Administration' } });

    // 2. Teacher Accounts
    const teacher1 = await prisma.user.create({ data: { email: 'nathan@matundu.ac.ke', password: hashedPassword, role: 'TEACHER', phone: '0727148126' } });
    await prisma.staff.create({ data: { userId: teacher1.id, employeeNumber: '675422', firstName: 'Nathan Mugambi', lastName: 'Njiru', gender: 'Male', qualification: 'B.Ed Science', specialization: 'Mathematics' } });

    const teacher2 = await prisma.user.create({ data: { email: 'prominah@matundu.ac.ke', password: hashedPassword, role: 'TEACHER', phone: '0718578752' } });
    await prisma.staff.create({ data: { userId: teacher2.id, employeeNumber: '541211', firstName: 'Prominah Syongombe', lastName: 'Robert', gender: 'Female', qualification: 'B.Ed Arts', specialization: 'English' } });

    // 3. Bursar Account
    const bursarUser = await prisma.user.create({ data: { email: 'bursar@matundu.ac.ke', password: hashedPassword, role: 'BURSAR', phone: '+254700000002' } });
    await prisma.staff.create({ data: { userId: bursarUser.id, employeeNumber: 'BUR-001', firstName: 'Finance', lastName: 'Bursar', gender: 'Male', qualification: 'CPA-K', specialization: 'School Accounts' } });

    // 4. Student Accounts
    const studentClass = classes[7] || classes[0]; // Grade 8 or Grade 1
    const studentUser = await prisma.user.create({ data: { email: 'student.117@matundu.ac.ke', password: hashedPassword, role: 'STUDENT' } });
    await prisma.student.create({
      data: {
        userId: studentUser.id,
        admissionNumber: 'MAT/2026/0117',
        firstName: 'BENSON',
        lastName: 'MUENI MWANZIA',
        gender: 'MALE',
        classId: studentClass.id,
        admissionStatus: 'APPROVED'
      }
    });

    const studentUser2 = await prisma.user.create({ data: { email: 'student.001@matundu.ac.ke', password: hashedPassword, role: 'STUDENT' } });
    await prisma.student.create({
      data: {
        userId: studentUser2.id,
        admissionNumber: 'MAT/2026/0001',
        firstName: 'ALICE',
        lastName: 'WANJIKU',
        gender: 'FEMALE',
        classId: studentClass.id,
        admissionStatus: 'APPROVED'
      }
    });

    logger.info('Database reseed completed successfully');
    res.json({
      success: true,
      message: 'Database reseeded successfully with full credentials',
      data: {
        grades: grades.length,
        classes: classes.length,
        teachers: 2,
        students: 2
      }
    });
  } catch (error) {
    logger.error({ message: 'Reseed error', error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message });
  }
});

// Non-destructive repair endpoint
app.post('/api/admin/repair', async (req, res) => {
  const { secretKey } = req.body;
  if (secretKey !== 'matundu-reseed-2026' && secretKey !== 'kyamatu-reseed-2026') {
    return res.status(403).json({ success: false, message: 'Invalid secret key' });
  }

  try {
    logger.info('Starting non-destructive repair...');
    let timetableResult = { generated: 0 };
    let assessmentCount = 0;

    // 1. Repair Timetable if empty
    const slotCount = await prisma.timetableSlot.count();
    if (slotCount === 0) {
      timetableResult = await timetableService.generateTimetable();
    }

    // 2. Repair Assessments if empty
    const existingAssessments = await prisma.assessment.count();
    if (existingAssessments === 0) {
      const currentTerm = await prisma.term.findFirst({
        where: { academicYear: { isCurrent: true } },
        orderBy: { startDate: 'desc' }
      });

      if (currentTerm) {
        const subjects = await prisma.subject.findMany();
        for (const subj of subjects) {
          await prisma.assessment.create({
            data: {
              name: 'Continuous Assessment 1',
              type: 'CAT',
              maxScore: 30,
              weight: 0.3,
              date: new Date(),
              subjectId: subj.id,
              termId: currentTerm.id
            }
          });
          assessmentCount++;
        }
      }
    }

    res.json({
      success: true,
      message: 'Repair completed successfully',
      data: {
        timetableSlotsGenerated: timetableResult.generated,
        assessmentsCreated: assessmentCount
      }
    });
  } catch (error) {
    logger.error({ message: 'Repair error', error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance/qr', qrAttendanceRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/integrations', integrationsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, async () => {
  logger.info({ message: `Server running on port ${PORT}`, env: config.env });

  // Auto-repair: ensure timetable and assessments exist on startup
  try {
    const slotCount = await prisma.timetableSlot.count();
    const assessmentCt = await prisma.assessment.count();

    if (slotCount === 0) {
      const result = await timetableService.generateTimetable();
      logger.info(`Auto-repair: generated ${result.generated} timetable slots`);
    }

    if (assessmentCt === 0) {
      logger.info('Auto-repair: No assessments found. Skipping auto-creation (disabled).');
    }

    // --- Always repair Course Outlines & Resources (independent of timetable/assessment) ---
    const terms = await prisma.term.findMany({
      where: { academicYear: { isCurrent: true } },
      orderBy: { termNumber: 'asc' }
    });

    if (terms.length > 0) {
      const classes = await prisma.class.findMany({
        include: {
          teacherAssignments: {
            where: { isClassTeacher: true },
            select: { staffId: true }
          }
        }
      });
      const subjects = await prisma.subject.findMany();
      const anyStaff = await prisma.staff.findFirst();

      // Subject-specific resource URLs
      const subjectResourceMap = {
        'Mathematics': { url: 'https://www.khanacademy.org/math', title: 'Khan Academy Mathematics', type: 'LINK' },
        'English': { url: 'https://learnenglish.britishcouncil.org/', title: 'British Council English Learning', type: 'LINK' },
        'Kiswahili': { url: 'https://www.bbc.com/swahili', title: 'BBC Kiswahili Resources', type: 'LINK' },
        'Science and Technology': { url: 'https://www.khanacademy.org/science', title: 'Khan Academy Science', type: 'LINK' },
        'Social Studies': { url: 'https://www.bbc.co.uk/cbbc/quizzes/social-studies', title: 'Social Studies Reference', type: 'LINK' },
        'CRE': { url: 'https://www.bible.com/', title: 'Bible Study Resources', type: 'LINK' },
        'Creative Arts': { url: 'https://www.tate.org.uk/learn', title: 'Tate Art Learning', type: 'LINK' },
        'PHE': { url: 'https://www.pe4life.org/resources/', title: 'Physical Education Resources', type: 'LINK' },
        'Agriculture': { url: 'https://www.fao.org/home/en/', title: 'FAO Agriculture Resources', type: 'LINK' },
        'Home Science': { url: 'https://extension.umn.edu/family-and-consumer-science', title: 'Home Science Resources', type: 'LINK' },
      };

      let outlinesCreated = 0;
      let resourcesCreated = 0;

      for (const term of terms) {
        for (const cls of classes) {
          for (const subj of subjects) {
            const assignment = await prisma.teacherAssignment.findFirst({
              where: { classId: cls.id, subjectId: subj.id }
            });
            const teacherId = assignment?.staffId || cls.teacherAssignments[0]?.staffId || anyStaff?.id;

            if (!teacherId) continue;

            // 1. Repair Outline
            const existingOutline = await prisma.courseOutline.findUnique({
              where: { classId_subjectId_termId: { classId: cls.id, subjectId: subj.id, termId: term.id } }
            });

            if (!existingOutline) {
              await prisma.courseOutline.create({
                data: {
                  classId: cls.id,
                  subjectId: subj.id,
                  termId: term.id,
                  teacherId,
                  title: `${subj.name} - Term ${term.termNumber} Outline`,
                  content: [
                    { title: 'Introduction', description: `${subj.name} core goals, objectives and overview of the term.`, type: 'LESSON', date: 'Week 1' },
                    { title: 'Core Modules', description: 'Exploring fundamental principles and practical applications of key concepts.', type: 'LESSON', date: 'Weeks 2-5' },
                    { title: 'Continuous Assessment (CAT)', description: 'Formal CAT evaluating term progress and understanding so far.', type: 'CAT', date: 'Week 6' },
                    { title: 'Advanced Topics', description: 'Building on foundations with specialized techniques and applications.', type: 'LESSON', date: 'Weeks 7-9' },
                    { title: 'Assignments', description: 'Individual and group assignment submissions.', type: 'ASSIGNMENT', date: 'Week 9' },
                    { title: 'Final Revision & Exam Prep', description: 'Comprehensive review and preparation for end-of-term examinations.', type: 'LESSON', date: 'Week 10' }
                  ]
                }
              });
              outlinesCreated++;
            }

            // 2. Repair Resources
            const existingResource = await prisma.courseResource.findFirst({
              where: { classId: cls.id, subjectId: subj.id, termId: term.id }
            });

            if (!existingResource) {
              // Find the base subject name (strip grade number suffix e.g. "Mathematics" from "Mathematics" or "MAT6")
              const baseName = Object.keys(subjectResourceMap).find(k => subj.name.startsWith(k)) || null;
              const resourceInfo = baseName ? subjectResourceMap[baseName] : {
                url: 'https://www.open.edu/openlearn/',
                title: `${subj.name} Study Materials`,
                type: 'LINK'
              };

              await prisma.courseResource.create({
                data: {
                  classId: cls.id,
                  subjectId: subj.id,
                  termId: term.id,
                  teacherId,
                  title: resourceInfo.title,
                  type: resourceInfo.type,
                  url: resourceInfo.url,
                  size: null
                }
              });
              resourcesCreated++;
            }
          }
        }
      }

      // Fix any existing resources that still have the placeholder URL
      const placeholderCount = await prisma.courseResource.count({
        where: { url: 'https://example.com/sample-resource.pdf' }
      });
      if (placeholderCount > 0) {
        for (const subj of subjects) {
          const baseName = Object.keys(subjectResourceMap).find(k => subj.name.startsWith(k)) || null;
          const resourceInfo = baseName ? subjectResourceMap[baseName] : {
            url: 'https://www.open.edu/openlearn/',
            title: `${subj.name} Study Materials`,
            type: 'LINK'
          };
          await prisma.courseResource.updateMany({
            where: { subjectId: subj.id, url: 'https://example.com/sample-resource.pdf' },
            data: { url: resourceInfo.url, title: resourceInfo.title, type: resourceInfo.type, size: null }
          });
        }
        logger.info(`Auto-repair: fixed ${placeholderCount} placeholder resource URLs.`);
      }

      if (outlinesCreated > 0) logger.info(`Auto-repair: created ${outlinesCreated} missing course outlines.`);
      if (resourcesCreated > 0) logger.info(`Auto-repair: created ${resourcesCreated} missing course resources.`);
    }

    logger.info('Auto-repair: complete');
  } catch (err) {
    logger.error({ message: 'Auto-repair failed (non-fatal)', error: err.message });
  }
});

export default app;
