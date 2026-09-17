import { WebSocketServer } from "ws";
import type { Server } from "http";

import { handleWebSocketEvent } from "./router";
import { AuthenticatedWebSocket, WebSocketEvent } from "./types";
import { authenticateWebSocket } from "./auth";

export  function createWebSocketServer(server: Server) {
  const wss = new WebSocketServer({
    server,
  });

  wss.on("connection", (socket) => {
    console.log("WebSocket connected");

    let authenticatedSocket: AuthenticatedWebSocket | null = null;

    socket.on("message", async (message) => {
      
  

      try {
        const event = JSON.parse(
          message.toString(),
        ) as WebSocketEvent & {
          accessToken?: string;
        };
    console.log("PARSED EVENT:", event);

        // Авторизация
        if (!authenticatedSocket) {
          if (event.type !== "auth" || !event.accessToken) {
            socket.send(
              JSON.stringify({
                type: "auth.error",
                message: "Authentication required",
              }),
            );

            socket.close();

            return;
          }

          const userId = authenticateWebSocket(
            event.accessToken,
          );

          authenticatedSocket =
            socket as AuthenticatedWebSocket;
          
          authenticatedSocket.userId = userId;

          console.log(
            `WebSocket authenticated: userId=${userId}`,
          );

          socket.send(
            JSON.stringify({
              type: "auth.success",
              message: "Authentication successful",
            }),
          );

          return;
        }
    console.log("BEFORE ROUTER:", event);

        // После авторизации
        await handleWebSocketEvent(
          authenticatedSocket,
          event,
        );
      } catch (error) {
        console.error("WebSocket error:", error);

        socket.send(
          JSON.stringify({
            type: "error",
            message: "Invalid WebSocket message",
          }),
        );
      }
    });

    socket.on("close", () => {
      console.log("WebSocket disconnected");
    });
  });

  return wss;
}