const pg = require('pg');

async function testConnection(region, port, project, pass) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const user = `postgres.${project}`;
    const connectionString = `postgresql://${user}:${encodeURIComponent(pass)}@${host}:${port}/postgres?sslmode=require${port === 6543 ? '&pgbouncer=true' : ''}`;

    const client = new pg.Client({
        connectionString,
        connectionTimeoutMillis: 3000,
    });

    try {
        await client.connect();
        console.log(`\n\n🎯 SUCCESS! Region: ${region}, Port: ${port}`);
        console.log(`URL: ${connectionString}`);
        process.exit(0);
    } catch (e) {
        process.stdout.write('.'); // Progress indicator
        if (!e.message.includes('Tenant or user not found') &&
            !e.message.includes('timeout') &&
            !e.message.includes('ECONNREFUSED')) {
            console.log(`\n[${region}:${port}] Interesting Error: ${e.message.substring(0, 100)}`);
            if (e.message.includes('password authentication failed')) {
                console.log(`\n🎯 FOUND REGION: ${region}! (Password failed but tenant exists)`);
                process.exit(0);
            }
        }
    } finally {
        await client.end().catch(() => { });
    }
}

async function main() {
    const project = "wgphgiyavzmzpfqygcpp";
    const pass = "NeverBroke@031";

    // Comprehensive list of Supabase/AWS regions
    const regions = [
        'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-central-2', 'eu-north-1', 'eu-south-1',
        'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
        'ca-central-1', 'sa-east-1',
        'me-south-1', 'me-central-1', 'af-south-1',
        'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 'ap-south-1'
    ];

    console.log(`Probing ${regions.length} regions...`);
    for (const region of regions) {
        await testConnection(region, 6543, project, pass);
        await testConnection(region, 5432, project, pass);
    }
    console.log("\nNo matches found.");
}

main();
