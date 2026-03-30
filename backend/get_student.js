import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const invoice = await prisma.studentInvoice.findFirst({
        where: {
            balance: { gt: 0 }
        },
        include: {
            student: {
                include: {
                    user: true
                }
            }
        }
    });

    if (invoice) {
        console.log(`Email: ${invoice.student.user.email}`);
        console.log(`Password: Admin@123`);
        console.log(`Balance: ${invoice.balance}`);
    } else {
        console.log('No student with a balance found.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
