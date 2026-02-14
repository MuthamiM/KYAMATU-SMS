import { PrismaClient } from '@prisma/client';
import * as timetableController from './src/features/academic/timetable.controller.js';
import * as attendanceController from './src/features/attendance/attendance.controller.js';

const p = new PrismaClient();

async function run() {
    console.log('--- EXPORT CHECK ---');
    console.log('timetableController.getMasterTimetable:', typeof timetableController.getMasterTimetable);
    console.log('attendanceController.getMyStats:', typeof attendanceController.getMyStats);

    console.log('\n--- DATA SEED ---');
    const count = await p.timetableSlot.count();
    console.log('Current slot count:', count);

    if (count === 0) {
        const terms = await p.term.findMany();
        const classes = await p.class.findMany();
        const teachers = await p.staff.findMany({
            include: { user: true }
        });
        const teacherUsers = teachers.filter(t => t.user?.role === 'TEACHER');
        const subjects = await p.subject.findMany();

        if (classes.length > 0 && teacherUsers.length > 0 && subjects.length > 0) {
            console.log('Seeding 5 sample slots...');
            for (let i = 0; i < 5; i++) {
                const cls = classes[i % classes.length];
                const teacher = teacherUsers[i % teacherUsers.length];
                const subject = subjects.find(s => s.gradeId === cls.gradeId) || subjects[0];

                await p.timetableSlot.create({
                    data: {
                        classId: cls.id,
                        teacherId: teacher.id,
                        subjectId: subject.id,
                        // Removed termId as it's not in TimetableSlot model
                        dayOfWeek: (i % 5) + 1,
                        startTime: '08:00',
                        endTime: '08:40'
                    }
                });
            }
            console.log('Seed successful.');
        } else {
            console.log('Missing prerequisite data: classes=', classes.length, 'teachers=', teacherUsers.length);
        }
    }
}

run().catch(console.error).finally(() => p.$disconnect());
