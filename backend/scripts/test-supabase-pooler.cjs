const { PrismaClient } = require('@prisma/client');

async function testConnection(region, port, user, pass) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const url = `postgresql://${user}:${encodeURIComponent(pass)}@${host}:${port}/postgres${port === 6543 ? '?pgbouncer=true' : ''}`;

    console.log(`Checking ${region} on port ${port} as ${user}...`);

    const prisma = new PrismaClient({
        datasources: { db: { url } },
        log: ['error']
    });

    try {
        // Use a short timeout for the connect
        const connectPromise = prisma.$connect();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));

        await Promise.race([connectPromise, timeoutPromise]);
        console.log(`  ✅ CONNECTED TO ${region} on ${port}!`);
        return true;
    } catch (e) {
        const msg = e.message.split('\n')[0];
        if (msg.includes('Tenant or user not found')) {
            // Keep silent for "not found" unless we want to log it
        } else if (msg.includes('Password authentication failed')) {
            console.log(`  🚩 FOUND TENANT in ${region}! But password failed.`);
            return true; // We found the region at least
        } else if (!msg.includes('Timeout') && !msg.includes('Can\'t reach database')) {
            console.log(`  ❌ ERROR in ${region}: ${msg}`);
        }
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const pass = "NeverBroke@031";
    const project = "wgphgiyavzmzpfqygcpp";
    const regions = [
        'eu-west-1', 'eu-west-2', 'eu-central-1',
        'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
        'af-south-1', 'ca-central-1', 'sa-east-1',
        'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-south-1'
    ];

    for (const region of regions) {
        // Try Transaction mode (6543) first as it's common for IPv4 pooler
        const found = await testConnection(region, 6543, `postgres.${project}`, pass);
        if (found) {
            console.log(`\n🎯 TARGET REGION IDENTIFIED: ${region}`);
            return;
        }

        // Try Session mode (5432) on pooler
        const foundSession = await testConnection(region, 5432, `postgres.${project}`, pass);
        if (foundSession) {
            console.log(`\n🎯 TARGET REGION IDENTIFIED: ${region}`);
            return;
        }
    }
    console.log("\nSearch complete. No pooler matched.");
}

main();
