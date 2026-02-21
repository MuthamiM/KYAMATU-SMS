import crypto from 'crypto';
import { markAttendance } from './attendance.service.js';
import prisma from '../../config/database.js';

// In-memory store for active QR sessions (token -> session data)
const activeSessions = new Map();

// Session expiry: 15 minutes
const SESSION_TTL_MS = 15 * 60 * 1000;

// Clean up expired sessions periodically
setInterval(() => {
    const now = Date.now();
    for (const [token, session] of activeSessions) {
        if (now > session.expiresAt) {
            activeSessions.delete(token);
        }
    }
}, 60 * 1000); // every 60s

/**
 * Generate a QR attendance session for a class.
 * Returns a unique token that encodes the session.
 */
export const generateQRSession = async (classId, termId, teacherId) => {
    // Verify class exists
    const classRecord = await prisma.class.findUnique({
        where: { id: classId },
        include: { grade: true, stream: true },
    });

    if (!classRecord) {
        throw new Error('Class not found');
    }

    // Generate unique token
    const token = crypto.randomBytes(6).toString('hex').toUpperCase(); // e.g. "A3F2B1C09D4E"

    const session = {
        token,
        classId,
        termId,
        teacherId,
        className: `${classRecord.grade.name} ${classRecord.stream.name}`,
        date: new Date().toISOString().split('T')[0],
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_TTL_MS,
        scannedStudents: new Set(),
    };

    activeSessions.set(token, session);

    return {
        token,
        className: session.className,
        date: session.date,
        expiresAt: new Date(session.expiresAt).toISOString(),
        expiresInMinutes: 15,
    };
};

/**
 * Verify QR attendance — student submits token to mark attendance.
 */
export const verifyQRAttendance = async (token, studentId) => {
    const session = activeSessions.get(token.toUpperCase());

    if (!session) {
        throw new Error('Invalid or expired QR code. Please ask your teacher to generate a new one.');
    }

    if (Date.now() > session.expiresAt) {
        activeSessions.delete(token);
        throw new Error('This QR code has expired. Please ask your teacher for a new code.');
    }

    // Check student belongs to this class
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true, classId: true, firstName: true, lastName: true },
    });

    if (!student) {
        throw new Error('Student not found');
    }

    if (student.classId !== session.classId) {
        throw new Error('You are not enrolled in this class.');
    }

    // Check if already scanned
    if (session.scannedStudents.has(studentId)) {
        throw new Error('You have already marked your attendance for this session.');
    }

    // Mark attendance
    await markAttendance({
        studentId,
        classId: session.classId,
        termId: session.termId,
        date: session.date,
        status: 'PRESENT',
        notes: 'Marked via QR code',
    });

    session.scannedStudents.add(studentId);

    return {
        success: true,
        studentName: `${student.firstName} ${student.lastName}`,
        className: session.className,
        date: session.date,
        markedAt: new Date().toISOString(),
        totalScanned: session.scannedStudents.size,
    };
};

/**
 * Get active session info (for teachers to see scan count).
 */
export const getSessionInfo = (token) => {
    const session = activeSessions.get(token.toUpperCase());
    if (!session) return null;

    return {
        token: session.token,
        className: session.className,
        date: session.date,
        expiresAt: new Date(session.expiresAt).toISOString(),
        totalScanned: session.scannedStudents.size,
        isExpired: Date.now() > session.expiresAt,
    };
};
