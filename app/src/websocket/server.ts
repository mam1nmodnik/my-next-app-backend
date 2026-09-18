import { WebSocketServer } from "ws";
import type { Server } from "http";

import { handleWebSocketEvent } from "./router";
import {
  AuthenticatedWebSocket,
  WebSocketEvent,
} from "./types";
import { authenticateWebSocket } from "./auth";
import { connectionManager } from "./connection.manager";

export function createWebSocketServer(server: Server) {
  const wss = new WebSocketServer({
    server,
  });

  wss.on("connection", (socket) => {
    console.log("WebSocket connected");

    let authenticatedSocket: AuthenticatedWebSocket | null = null;

    socket.on("message", async (message) => {
      console.log(
        "🔥 RAW MESSAGE:",
        message.toString(),
      );

      try {
        const event = JSON.parse(
          message.toString(),
        ) as WebSocketEvent & {
          accessToken?: string;
        };

        console.log("PARSED EVENT:", event);

        /**
         * Первое сообщение обязательно должно быть auth
         */
        if (!authenticatedSocket) {
          if (
            event.type !== "auth" ||
            !event.accessToken
          ) {
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

          connectionManager.add(
            authenticatedSocket,
          );

          console.log(
            `WebSocket authenticated: userId=${userId}`,
          );

          socket.send(
            JSON.stringify({
              type: "auth.success",
              message:
                "Authentication successful",
            }),
          );

          return;
        }

        console.log("BEFORE ROUTER:", event);

        await handleWebSocketEvent(
          authenticatedSocket,
          event,
        );
      } catch (error) {
        console.error(
          "WebSocket error:",
          error,
        );

        socket.send(
          JSON.stringify({
            type: "error",
            message:
              "Invalid WebSocket message",
          }),
        );
      }
    });

    socket.on("close", () => {
      console.log(
        "WebSocket disconnected",
      );

      if (authenticatedSocket) {
        connectionManager.remove(
          authenticatedSocket,
        );

        console.log(
          `WebSocket removed: userId=${authenticatedSocket.userId}`,
        );
      }
    });

    socket.on("error", (error) => {
      console.error(
        "WebSocket socket error:",
        error,
      );
    });
  });

  return wss;
}