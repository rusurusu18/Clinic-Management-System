import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import prisma from "./config/database.js";
import { initializeSocket } from "./config/socket.js";

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('[DB]: Connected successfully');

    const server = createServer(app);
    initializeSocket(server);
server.listen(ENV.PORT, () => {
      console.log(`[Server]: Running on port ${ENV.PORT} (${ENV.NODE_ENV})`);
      console.log(`[WebSocket]: Running on localhost:${ENV.PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`\n[${signal}]: Shutting down gracefully...`);
      server.close(async () => {
        try {
          await prisma.$disconnect();
          console.log('[DB]: Disconnected');
          process.exit(0);
        } catch (err) {
          console.error('[Shutdown error]:', err);
          process.exit(1);
        }
      });
      setTimeout(() => {
        console.error('[Shutdown]: Forced exit after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[Server Error]: Port ${ENV.PORT} is already in use`);
      } else {
        console.error('[Server Error]:', err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('[Startup Error]: Failed to start server');
    console.error(err);
    try {
      await prisma.$disconnect();
    } catch (_) { /* ignore */ }
    process.exit(1);
  }
};

startServer();