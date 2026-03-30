const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
    const url = process.env.DATABASE_URL;
    console.log(`Testing connection to: ${url.replace(/:[^:@]*@/, ':****@')}`); // Hide password in logs

    const prisma = new PrismaClient({
        datasources: { db: { url } },
        log: ['info', 'warn', 'error'],
    });

    try {
        console.log('Connecting...');
        await prisma.$connect();
        console.log('✅ Connection successful!');

        // Try a simple query
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        console.log('Query result:', result);

    } catch (e) {
        console.error('❌ Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
