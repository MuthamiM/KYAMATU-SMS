# Kyamatu Primary School Management System

A comprehensive, production-grade School Management System aligned with Kenya's Competency-Based Curriculum (CBC).

## Features

- **Student Management** - Admissions, profiles, guardians, promotion
- **Staff Management** - Teachers, assignments, workload
- **Academic Structure** - CBC grades PP1-Grade 9, terms, classes, subjects
- **Attendance Tracking** - Daily marking, reports, statistics
- **Assessment & Grading** - CATs, exams, CBC competencies, traditional marks
- **Report Cards** - Class rankings, mean scores, PDF generation
- **Fees Management** - Invoicing, payments, M-Pesa ready
- **Communication** - Announcements, messaging

## Tech Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend  | Node.js 20 + Express.js        |
| Database | PostgreSQL 15 + Prisma ORM     |
| Auth     | JWT + bcrypt                   |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Docker)
- npm or yarn

### Using Docker (Recommended)

```bash
docker-compose up -d
```

This starts:

- PostgreSQL on port 5432
- Backend API on port 3000
- Frontend on port 5173

### Manual Setup

1. **Database Setup**

```bash
cd backend
npm install
npx prisma migrate dev
npm run db:seed
```

2. **Start Backend**

```bash
npm run dev
```

3. **Start Frontend**

```bash
cd frontend
npm install
npm run dev
```

## Test Credentials

| Role    | Email                  | Password  |
| ------- | ---------------------- | --------- |
| Admin   | admin@kyamatu.ac.ke    | Admin@123 |
| Teacher | teacher@kyamatu.ac.ke  | Admin@123 |
| Bursar  | bursar@kyamatu.ac.ke   | Admin@123 |
| Student | student1@kyamatu.ac.ke | Admin@123 |

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get profile

### Students

- `GET /api/students` - List students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student
- `POST /api/students/:id/approve` - Approve admission

### Academic

- `GET /api/academic/years` - List academic years
- `GET /api/academic/classes` - List classes
- `GET /api/academic/subjects` - List subjects

### Reports

- `POST /api/reports/generate` - Generate report card
- `GET /api/reports/class/:id/rankings` - Get class rankings

### Fees

- `GET /api/fees/structures` - Fee structures
- `POST /api/fees/invoices` - Generate invoice
- `POST /api/fees/payments` - Record payment

## Project Structure

```
kyamatu-sms/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── features/       # Feature modules
│   │   │   ├── auth/
│   │   │   ├── students/
│   │   │   ├── staff/
│   │   │   ├── academic/
│   │   │   ├── attendance/
│   │   │   ├── assessments/
│   │   │   ├── reports/
│   │   │   ├── fees/
│   │   │   └── communication/
│   │   ├── middleware/     # Auth, RBAC, validation
│   │   └── utils/          # Helpers, errors
│   └── prisma/             # Database schema
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── stores/         # Zustand stores
│   └── index.html
└── docker-compose.yml
```

## CBC Grading System

### Competency Ratings

- **EE** - Exceeding Expectations (75%+)
- **ME** - Meeting Expectations (50-74%)
- **AE** - Approaching Expectations (25-49%)
- **BE** - Below Expectations (<25%)

### Traditional Grades

- **A** - 80%+ (Excellent)
- **B** - 70-79% (Good)
- **C** - 60-69% (Average)
- **D** - 50-59% (Below Average)
- **E** - <50% (Poor)

## Security

- JWT authentication with refresh tokens
- Password hashing (bcrypt, 12 rounds)
- Role-based access control (RBAC)
- Input validation
- Rate limiting
- Helmet security headers

## Future Enhancements

- [ ] Flutter parent app
- [ ] PDF report card generation
- [ ] M-Pesa STK Push integration
- [ ] SMS/Email notifications
- [ ] Timetable generation
- [ ] Multi-school support

## License

MIT
