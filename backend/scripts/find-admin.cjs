const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    try {
        const admins = await prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'SUPER_ADMIN']
                }
            }
        });

        console.log(`Found ${admins.length} admins.`);

        const testPasswords = ['password', '123456', 'admin', 'admin123', 'superadmin', 'NeverBroke@031'];

        for (const u of admins) {
            console.log(`\nEmail: ${u.email}`);
            console.log(`Role: ${u.role}`);

            let found = false;
            for (const p of testPasswords) {
                if (await bcrypt.compare(p, u.password)) {
                    console.log(`  ✅ Password matches: "${p}"`);
                    found = true;
                    break;
                }
            }
            if (!found) console.log('  ❌ No common password matched.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
