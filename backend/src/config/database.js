import dotenv from "dotenv";
import PrismaClientModule from "../../generated/prisma/index.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

dotenv.config();

const { PrismaClient } = PrismaClientModule;

const DATABASE_URL = process.env.DATABASE_URL;

console.log(
    "DATABASE_URL:",
    DATABASE_URL
        ? DATABASE_URL.replace(/:[^:@]+@/, ":****@")
        : "UNDEFINED"
);

if (!DATABASE_URL) {
    throw new Error(
        "DATABASE_URL is not loaded. Make sure .env is in the backend root."
    );
}

function parseDbUrl(url) {
    try {
        const normalized = url.replace(/^[^:]+:\/\//, "https://");
        const parsed = new URL(normalized);

        return {
            host: parsed.hostname,
            port: parsed.port ? Number(parsed.port) : 3306,
            user: decodeURIComponent(parsed.username),
            password: decodeURIComponent(parsed.password),
            database: parsed.pathname.replace(/^\/+/, "").split("?")[0],
        };
    } catch (error) {
        console.error("Failed to parse DATABASE_URL:", error.message);
        return null;
    }
}

const dbConfig = parseDbUrl(DATABASE_URL);

if (!dbConfig) {
    throw new Error("Invalid DATABASE_URL");
}

console.log("Database config:", {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
});

const adapter = new PrismaMariaDb({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,

    connectionLimit: 5,
    connectTimeout: 5000,
    acquireTimeout: 15000,
    idleTimeout: 300,
});

const prisma = new PrismaClient({
    adapter,
});

export default prisma;