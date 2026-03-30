const { PrismaClient } = require('@prisma/client');

async function testConnection(user, port, pass) {
    const host = 'aws-1-eu-west-1.pooler.supabase.com';
    const url = `postgresql://${user}:${encodeURIComponent(pass)}@${host}:${port}/postgres${port === 6543 ? '?pgbouncer=true' : ''}`;

    console.log(`Testing: ${user} on port ${port}...`);

    const prisma = new PrismaClient({
        datasources: { db: { url } },
        log: ['error']
    });

    try {
        await prisma.$connect();
        console.log(`✅ SUCCESS: ${user} on ${port}`);
        return true;
    } catch (e) {
        const msg = e.message.split('\n')[0];
        console.log(`❌ FAILED: ${msg}`);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const project = "wgphgiyavzmzpfqygcpp";
    const pass = "op6jWawiLliW1hhK";

    // Try both username formats
    const users = [`postgres.${project}`, 'postgres'];
    const ports = [6543, 5432];

    for (const u of users) {
        for (const p of ports) {
            const ok = await testConnection(u, p, pass);
            if (ok) return;
        }
    }
}

main();
