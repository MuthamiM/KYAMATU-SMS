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

import authRoutes from './features/auth/auth.routes.js';
import studentsRoutes from './features/students/students.routes.js';
import staffRoutes from './features/staff/staff.routes.js';
import academicRoutes from './features/academic/academic.routes.js';
import attendanceRoutes from './features/attendance/attendance.routes.js';
import assessmentsRoutes from './features/assessments/assessments.routes.js';
import reportsRoutes from './features/reports/reports.routes.js';
import feesRoutes from './features/fees/fees.routes.js';
import communicationRoutes from './features/communication/communication.routes.js';
import timetableRoutes from './features/academic/timetable.routes.js';
import dashboardRoutes from './features/dashboard/dashboard.routes.js';

const app = express();

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
    if (origin === allowedOrigin || origin.endsWith('.kyamatu-frontend.pages.dev') || origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    
    // For debugging connection issues, you might want to log blocked origins
    // console.log('Blocked CORS origin:', origin);
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
    message: 'KYAMATU-SMS API is running', 
    version: '1.0.0',
    status: 'ok',
    env: config.env,
    requestId: req.id 
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'KYAMATU-SMS API Base Endpoint',
    docs: '/api/docs', // if any
    health: '/api/health',
    status: 'ok',
    requestId: req.id 
  });
});

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
  if (secretKey !== 'kyamatu-reseed-2026') {
    return res.status(403).json({ success: false, message: 'Invalid secret key' });
  }

  try {
    logger.info('Starting database reseed via API...');
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash('Admin@123', 12);

    // Clean up
    await prisma.timetableSlot.deleteMany();
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
    await prisma.teacherAssignment.deleteMany();
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
    await prisma.term.create({ data: { name: 'Term 2', termNumber: 2, startDate: new Date('2026-05-02'), endDate: new Date('2026-08-10'), academicYearId: currentYear.id }});
    await prisma.term.create({ data: { name: 'Term 3', termNumber: 3, startDate: new Date('2026-09-01'), endDate: new Date('2026-11-25'), academicYearId: currentYear.id }});

    // Grades
    const grades = [];
    for (let i = 1; i <= 6; i++) {
      const g = await prisma.grade.create({ data: { name: `Grade ${i}`, level: i } });
      grades.push(g);
    }

    // Streams
    const streamEast = await prisma.stream.create({ data: { name: 'East' } });
    const streamWest = await prisma.stream.create({ data: { name: 'West' } });

    // Classes & Subjects
    const subjects = ['Mathematics', 'English', 'Kiswahili', 'Science and Technology', 'Social Studies', 'CRE', 'Creative Arts', 'PHE', 'Agriculture', 'Home Science'];
    const classes = [];
    for (const grade of grades) {
      for (const subj of subjects) {
        await prisma.subject.create({ data: { name: subj, code: `${subj.substring(0,3).toUpperCase()}${grade.level}`, gradeId: grade.id }});
      }
      const streamsForGrade = grade.level === 4 ? [streamEast, streamWest] : [streamEast];
      for (const stream of streamsForGrade) {
        const cls = await prisma.class.create({
          data: { name: `${grade.name} ${stream.name}`, capacity: 40, gradeId: grade.id, streamId: stream.id, academicYearId: currentYear.id }
        });
        classes.push({ ...cls, grade });
      }
    }

    // Headmaster
    const headUser = await prisma.user.create({ data: { email: 'headmaster@kyamatu.ac.ke', password: hashedPassword, role: 'SUPER_ADMIN', phone: '+254700000001' }});
    await prisma.staff.create({ data: { userId: headUser.id, employeeNumber: 'ADM001', firstName: 'Joseph', lastName: 'Mutua', gender: 'Male', qualification: 'M.Ed', specialization: 'Administration' }});

    // Deputy
    const depUser = await prisma.user.create({ data: { email: 'deputy@kyamatu.ac.ke', password: hashedPassword, role: 'ADMIN', phone: '+254700000002' }});
    await prisma.staff.create({ data: { userId: depUser.id, employeeNumber: 'ADM002', firstName: 'Margaret', lastName: 'Wambua', gender: 'Female', qualification: 'B.Ed', specialization: 'Curriculum' }});

    // System Admin
    await prisma.user.create({ data: { email: 'admin@kyamatu.ac.ke', password: hashedPassword, role: 'SUPER_ADMIN', phone: '+254700000000' }});

    // Bursar
    const bursarUser = await prisma.user.create({ data: { email: 'bursar@kyamatu.ac.ke', password: hashedPassword, role: 'BURSAR', phone: '+254700000003' }});
    await prisma.staff.create({ data: { userId: bursarUser.id, employeeNumber: 'FIN001', firstName: 'Samuel', lastName: 'Kioko', gender: 'Male', qualification: 'B.Com', specialization: 'Finance' }});

    // 10 Teachers
    const teachers = [
      { email: 'jmusa@kyamatu.ac.ke', emp: 'TSC001', first: 'John', last: 'Musa', spec: 'Mathematics' },
      { email: 'mmwende@kyamatu.ac.ke', emp: 'TSC002', first: 'Mary', last: 'Mwende', spec: 'English' },
      { email: 'pkimani@kyamatu.ac.ke', emp: 'TSC003', first: 'Peter', last: 'Kimani', spec: 'Science' },
      { email: 'gwanjiku@kyamatu.ac.ke', emp: 'TSC004', first: 'Grace', last: 'Wanjiku', spec: 'Kiswahili' },
      { email: 'dotieno@kyamatu.ac.ke', emp: 'TSC005', first: 'David', last: 'Otieno', spec: 'Social Studies' },
      { email: 'fnzuki@kyamatu.ac.ke', emp: 'TSC006', first: 'Faith', last: 'Nzuki', spec: 'CRE' },
      { email: 'bkiprop@kyamatu.ac.ke', emp: 'TSC007', first: 'Brian', last: 'Kiprop', spec: 'Arts' },
      { email: 'enjoroge@kyamatu.ac.ke', emp: 'TSC008', first: 'Esther', last: 'Njoroge', spec: 'PHE' },
      { email: 'cmuturi@kyamatu.ac.ke', emp: 'TSC009', first: 'Collins', last: 'Muturi', spec: 'Agriculture' },
      { email: 'akinya@kyamatu.ac.ke', emp: 'TSC010', first: 'Alice', last: 'Kinya', spec: 'Home Science' },
    ];
    for (const t of teachers) {
      const u = await prisma.user.create({ data: { email: t.email, password: hashedPassword, role: 'TEACHER', phone: `+2547${Math.floor(Math.random()*100000000).toString().padStart(8,'0')}` }});
      await prisma.staff.create({ data: { userId: u.id, employeeNumber: t.emp, firstName: t.first, lastName: t.last, gender: t.first === 'Mary' || t.first === 'Grace' || t.first === 'Faith' || t.first === 'Esther' || t.first === 'Alice' ? 'Female' : 'Male', specialization: t.spec }});
    }

    // 3 Support Staff
    await prisma.staff.create({ data: { employeeNumber: 'SUP001', firstName: 'James', lastName: 'Mutiso', gender: 'Male', specialization: 'Security' }});
    await prisma.staff.create({ data: { employeeNumber: 'SUP002', firstName: 'Rose', lastName: 'Muthoni', gender: 'Female', specialization: 'Cook' }});
    await prisma.staff.create({ data: { employeeNumber: 'SUP003', firstName: 'Patrick', lastName: 'Kamau', gender: 'Male', specialization: 'Groundskeeper' }});

    // 10 Students per class
    const firstNamesMale = ['James', 'John', 'Peter', 'David', 'Michael', 'Brian', 'Kevin', 'Dennis', 'Collins', 'Victor'];
    const firstNamesFemale = ['Mary', 'Grace', 'Faith', 'Joy', 'Mercy', 'Alice', 'Sarah', 'Rose', 'Esther', 'Nancy'];
    const lastNames = ['Mwangi', 'Otieno', 'Kamau', 'Wanjiku', 'Ochieng', 'Njoroge', 'Kipchoge', 'Wambui', 'Kimani', 'Mutua'];
    
    let studentNum = 1;
    for (const cls of classes) {
      for (let i = 0; i < 10; i++) {
        const isMale = Math.random() > 0.5;
        const firstName = isMale ? firstNamesMale[i % 10] : firstNamesFemale[i % 10];
        const lastName = lastNames[Math.floor(Math.random() * 10)];
        const admissionNumber = `KPS/${new Date().getFullYear()}/${String(studentNum).padStart(4, '0')}`;
        
        const studentUser = await prisma.user.create({
          data: { email: `student${studentNum}@kyamatu.ac.ke`, password: hashedPassword, role: 'STUDENT', phone: null }
        });
        await prisma.student.create({
          data: {
            userId: studentUser.id,
            admissionNumber,
            firstName,
            lastName,
            gender: isMale ? 'Male' : 'Female',
            dateOfBirth: new Date(2020 - cls.grade.level, Math.floor(Math.random()*12), Math.floor(Math.random()*28)+1),
            admissionDate: new Date('2026-01-05'),
            classId: cls.id,
            status: 'ACTIVE'
          }
        });
        studentNum++;
      }
    }

    logger.info('Database reseed completed successfully');
    res.json({ 
      success: true, 
      message: 'Database reseeded successfully', 
      data: { 
        grades: grades.length,
        classes: classes.length,
        teachers: teachers.length,
        students: studentNum - 1
      }
    });
  } catch (error) {
    logger.error({ message: 'Reseed error', error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  logger.info({ message: `Server running on port ${PORT}`, env: config.env });
});

export default app;

