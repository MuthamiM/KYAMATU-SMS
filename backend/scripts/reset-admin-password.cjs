const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    try {
        const email = 'admin@kyamatu.ac.ke';
        const newPassword = 'admin123';

        // Check if user exists first
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log(`User ${email} not found!`);
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        console.log(`✅ Password for ${email} has been reset to "${newPassword}"`);

    } catch (e) {
        console.error('Error resetting password:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
