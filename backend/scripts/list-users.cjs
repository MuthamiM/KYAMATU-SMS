const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            take: 10,
            include: {
                student: true,
                staff: true,
                // admin removed
            }
        });

        console.log(`Found ${users.length} users.`);

        const testPasswords = ['password', '123456', 'admin', 'student', 'NeverBroke@031', 'password123'];

        for (const u of users) {
            console.log(`\nUser: ${u.email} (${u.role})`);
            if (u.student) console.log(`  Student Admission: ${u.student.admissionNumber}`);

            let found = false;
            for (const p of testPasswords) {
                // Handle null password just in case (though schema likely forbids)
                if (u.password && await bcrypt.compare(p, u.password)) {
                    console.log(`  ✅ Password matches: "${p}"`);
                    found = true;
                    break;
                }
            }

            if (!found && u.role === 'STUDENT' && u.student?.admissionNumber) {
                console.log(`  ℹ️  Student fallback: Password = Admission Number ("${u.student.admissionNumber}") should work.`);
            }

            if (!found) console.log('  ❌ No common password matched.');
        }

    } catch (e) {
        console.error('Error listing users:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
