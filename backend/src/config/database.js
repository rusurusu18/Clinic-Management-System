import PrismaClientModule from '../generated/prisma/index.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const { PrismaClient } = PrismaClientModule;
const connectionString = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/clinic_management';

let prisma;

try {
  const adapter = new PrismaMariaDb({ connectionString });
  prisma = new PrismaClient({ adapter });
} catch (error) {
  prisma = new Proxy({}, {
    get() {
      throw new Error('Database is not configured. Set DATABASE_URL in .env or start your MySQL server.');
    },
  });
}

export default prisma;