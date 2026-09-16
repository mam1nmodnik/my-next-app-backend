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

  server.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}`);
  });

  prisma.$connect().then(() => {
    console.log("Connected to the database");
  }).catch((err) => {
    console.error("Failed to connect to the database", err);
    process.exit(1);
  });

}

main().catch(async (error) => {
  prisma.$disconnect();
  console.error(error);
  process.exit(1);
});
