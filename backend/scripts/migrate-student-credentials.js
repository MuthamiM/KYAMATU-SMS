import prisma from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import config from '../src/config/index.js';

async function migrate() {
    console.log('Starting student credential migration...');

    const students = await prisma.student.findMany({
        include: {
            user: true
        }
    });

    console.log(`Found ${students.length} students to update.`);

    for (const student of students) {
        try {
            const firstInitial = student.firstName.charAt(0).toLowerCase();
            const lastName = student.lastName.toLowerCase().replace(/\s+/g, '');
            const newEmail = `${firstInitial}${lastName}@kyamatu.ac.ke`;

            // Hash admission number as password
            const hashedPassword = await bcrypt.hash(student.admissionNumber, config.bcrypt.rounds);

            await prisma.user.update({
                where: { id: student.userId },
                data: {
                    email: newEmail,
                    password: hashedPassword
                }
            });

            console.log(`Updated: ${student.firstName} ${student.lastName} -> ${newEmail} (Password: ${student.admissionNumber})`);
        } catch (error) {
            console.error(`Failed to update student ${student.id}:`, error.message);
        }
    }

    console.log('Migration completed.');
    process.exit(0);
}

migrate();
