import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import prisma from "./config/database.js";
import { initializeSocket } from "./config/socket.js";

//connect to database
await prisma.$connect()

const server = createServer(app)
initializeSocket(server)  // initialize socket.io with the server

app.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
    console.log(`websocket is running on localhost :${ENV.PORT}`);
});