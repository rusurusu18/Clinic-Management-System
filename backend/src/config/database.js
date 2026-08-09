import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaMariaDb({ connectionString });

export const prisma = new PrismaClient({ adapter });

export default prisma;