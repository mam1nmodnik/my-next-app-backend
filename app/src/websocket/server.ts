import { WebSocketServer } from "ws";
import type { Server } from "http";

export function createWebSocketServer(server: Server) {
  const wss = new WebSocketServer({
    server,
  });

  wss.on("connection", (socket) => {
    console.log("WebSocket connected");

    socket.on("message", (message) => {
      console.log("Message:", message.toString());
    });

    socket.on("close", () => {
      console.log("WebSocket disconnected");
    });
  });

  return wss;
}