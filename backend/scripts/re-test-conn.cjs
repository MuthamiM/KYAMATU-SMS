const { PrismaClient } = require('@prisma/client');

async function test(url) {
    console.log(`Testing: ${url.replace(/:[^:@]+@/, ':****@')}`);
    const prisma = new PrismaClient({
        datasources: { db: { url } },
    });
    try {
        await prisma.$connect();
        console.log('  ✅ SUCCESS!');
        return true;
    } catch (e) {
        console.log(`  ❌ FAIL: ${e.message.split('\n')[0]}`);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const pass = "ANyOVonoMkQVgv52";
    const project = "wgphgiyavzmzpfqygcpp";

    const urls = [
        `postgresql://postgres.${project}:${pass}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
        `postgresql://postgres.${project}:${pass}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
        `postgresql://postgres:${pass}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
        `postgresql://postgres:${pass}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
    ];

    for (const url of urls) {
        if (await test(url)) break;
    }
}

main();
