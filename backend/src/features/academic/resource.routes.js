import express from 'express';
import * as resourceController from './resource.controller.js';
import { authenticate as isAuth } from '../../middleware/auth.js';
import { isTeacher, isStaff, isStudent } from '../../middleware/rbac.js';

import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists (Multer silently fails if it doesn't)
const uploadDir = path.join(__dirname, '../../../../public/uploads/resources');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed'));
        }
    }
});

const router = express.Router();

// Get resources (Students, Teachers, Admin)
router.get('/:classId/:subjectId', isAuth, resourceController.getResources);

// Create resource (Teachers only)
// Note: We use upload.single('file') to accept the multipart file
router.post('/', isAuth, isTeacher, upload.single('file'), resourceController.createResource);

// Delete resource (Teachers/Admins)
router.delete('/:id', isAuth, isTeacher, resourceController.deleteResource);

export default router;
