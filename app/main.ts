import "dotenv/config";

import { createApp } from "./src/app";
import { env } from "./src/shared/config/env";
import { prisma } from "./src/shared/db/prisma";
import { createServer } from "http";
import { createWebSocketServer } from "./src/websocket/server";

const app = createApp();
const server = createServer(app);

createWebSocketServer(server);

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database");

    server.listen(env.port, "0.0.0.0", () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();