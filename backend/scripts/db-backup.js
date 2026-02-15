import prisma from '../src/config/database.js';
import fs from 'fs';
import path from 'path';

async function backup() {
    console.log('Starting full database backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    const models = [
        'user', 'staff', 'student', 'class', 'subject', 'grade', 'stream',
        'academicYear', 'term', 'timetableSlot', 'attendance', 'assessment',
        'assessmentScore', 'studentInvoice', 'invoiceItem', 'payment',
        'courseOutline', 'guardian', 'studentGuardian', 'announcement', 'message'
    ];

    const backupData = {};

    for (const model of models) {
        try {
            console.log(`Backing up ${model}...`);
            backupData[model] = await prisma[model].findMany();
        } catch (error) {
            console.error(`Failed to backup ${model}:`, error.message);
        }
    }

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`\n✅ Backup completed successfully: ${backupFile}`);
    console.log(`Total records backed up: ${Object.values(backupData).flat().length}`);
    process.exit(0);
}

backup();
