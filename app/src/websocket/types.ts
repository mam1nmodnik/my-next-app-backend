import { WebSocket } from "ws";

export type WebSocketEvent = {
  type: string;
  requestId?: string;
  data?: unknown;
};

export type AuthenticatedWebSocket = WebSocket & {
  userId: number;
};