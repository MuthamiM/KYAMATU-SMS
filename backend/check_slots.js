import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
    const count = await p.timetableSlot.count();
    console.log('SLOT_COUNT:', count);
}
run().catch(console.error).finally(() => p.$disconnect());
