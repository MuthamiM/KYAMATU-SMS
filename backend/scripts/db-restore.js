import prisma from '../src/config/database.js';
import fs from 'fs';
import path from 'path';

async function restore() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: node db-restore.js <path-to-backup.json>');
        process.exit(1);
    }

    const backupFile = args[0];
    if (!fs.existsSync(backupFile)) {
        console.error(`Backup file not found: ${backupFile}`);
        process.exit(1);
    }

    console.log(`Starting database restoration from ${backupFile}...`);
    const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

    // Order of restoration to avoid foreign key violations
    const order = [
        'user', 'academicYear', 'term', 'grade', 'stream', 'class', 'subject',
        'staff', 'student', 'guardian', 'studentGuardian', 'classSubject',
        'teacherAssignment', 'timetableSlot', 'attendance', 'assessment',
        'assessmentScore', 'studentInvoice', 'invoiceItem', 'payment',
        'courseOutline', 'announcement', 'message'
    ];

    for (const model of order) {
        if (data[model] && data[model].length > 0) {
            console.log(`Restoring ${model} (${data[model].length} records)...`);
            for (const item of data[model]) {
                try {
                    // Use upsert to avoid duplicates and handle updates
                    const whereField = model === 'user' ? { email: item.email } : { id: item.id };

                    // Flatten relations if they were exported (findMany shouldn't have nested objects unless included)
                    const cleanData = { ...item };

                    await prisma[model].upsert({
                        where: { id: item.id },
                        update: cleanData,
                        create: cleanData
                    });
                } catch (error) {
                    console.warn(`Failed to restore record in ${model}:`, error.message);
                }
            }
        }
    }

    console.log('\n✅ Restoration logic completed.');
    process.exit(0);
}

restore();
