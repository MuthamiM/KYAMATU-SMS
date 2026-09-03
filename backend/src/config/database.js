import { PrismaClient } from '@prisma/client';

// Sanitize DATABASE_URL if quotes, whitespace, or prefixes were mistakenly pasted into hosting config
if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL.trim();
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  if (url.startsWith('DATABASE_URL=')) {
    url = url.replace('DATABASE_URL=', '').trim();
  }
  if (url.startsWith('psql ')) {
    url = url.replace(/^psql\s+['"]?/, '').replace(/['"]?$/, '').trim();
  }
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  process.env.DATABASE_URL = url;
}

const prisma = new PrismaClient({
  datasources: process.env.DATABASE_URL ? {
    db: {
      url: process.env.DATABASE_URL,
    },
  } : undefined,
  log: ['error', 'warn'],
});

export default prisma;

