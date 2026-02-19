import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkStudentAccounts() {
    console.log('--- Student Account Diagnostic ---');

    const students = await prisma.student.findMany({
        include: {
            user: true
        }
    });

    console.log(`Total students: ${students.length}`);

    const results = {
        missingUser: [],
        wrongRole: [],
        deactivated: [],
        ok: []
    };

    students.forEach(s => {
        if (!s.user) {
            results.missingUser.push({ id: s.id, name: `${s.firstName} ${s.lastName}`, adm: s.admissionNumber });
        } else {
            if (s.user.role !== 'STUDENT') {
                results.wrongRole.push({ id: s.id, name: `${s.firstName} ${s.lastName}`, role: s.user.role });
            } else if (!s.user.isActive) {
                results.deactivated.push({ id: s.id, name: `${s.firstName} ${s.lastName}` });
            } else {
                results.ok.push({ id: s.id, name: `${s.firstName} ${s.lastName}` });
            }
        }
    });

    console.log(`\nOK: ${results.ok.length}`);

    if (results.missingUser.length > 0) {
        console.log(`\nMissing User Account: ${results.missingUser.length}`);
        results.missingUser.slice(0, 5).forEach(u => console.log(` - ${u.name} (${u.adm})`));
    }

    if (results.wrongRole.length > 0) {
        console.log(`\nWrong Role (Not STUDENT): ${results.wrongRole.length}`);
        results.wrongRole.slice(0, 5).forEach(u => console.log(` - ${u.name} (Role: ${u.role})`));
    }

    if (results.deactivated.length > 0) {
        console.log(`\nDeactivated Accounts: ${results.deactivated.length}`);
        results.deactivated.slice(0, 5).forEach(u => console.log(` - ${u.name}`));
    }

    // Sample admission numbers to check case sensitivity
    console.log('\nSample Admission Numbers:');
    students.slice(0, 5).forEach(s => console.log(` - "${s.admissionNumber}"`));

    await prisma.$disconnect();
}

checkStudentAccounts();
