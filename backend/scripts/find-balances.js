import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findUsers() {
    const bursar = await prisma.user.findFirst({
        where: { role: 'BURSAR' },
        include: { staff: true }
    });
    console.log("=== BURSAR CREDENTIALS ===");
    if (bursar) {
        console.log(`Email: ${bursar.email}`);
        console.log(`Password: Admin@123 (default)`);
    } else {
        console.log("No BURSAR found.");
    }

    console.log("\n=== STUDENTS WITH BALANCES > 0 ===");
    const invoices = await prisma.studentInvoice.findMany({
        where: { balance: { gt: 0 } },
        include: {
            student: {
                include: {
                    user: true
                }
            }
        },
        take: 5
    });

    if (invoices.length === 0) {
        console.log("No students found with a balance > 0.");
    } else {
        invoices.forEach(inv => {
            console.log(`Name: ${inv.student.firstName} ${inv.student.lastName}`);
            console.log(`Admission No: ${inv.student.admissionNumber}`);
            console.log(`Email: ${inv.student.user.email}`);
            console.log(`Password: Admin@123 (or their admission number)`);
            console.log(`Invoice No: ${inv.invoiceNo} | Balance: KES ${inv.balance}\n`);
        });
    }
}

findUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
