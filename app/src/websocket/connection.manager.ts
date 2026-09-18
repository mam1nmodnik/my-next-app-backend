import { AuthenticatedWebSocket } from "./types";

class ConnectionManager {
  private connections = new Map<
    number,
    Set<AuthenticatedWebSocket>
  >();

  add(socket: AuthenticatedWebSocket) {
    const userConnections = this.connections.get(socket.userId);

    if (userConnections) {
      userConnections.add(socket);
      return;
    }

    this.connections.set(socket.userId, new Set([socket]));
  }

  remove(socket: AuthenticatedWebSocket) {
    const userConnections = this.connections.get(socket.userId);

    if (!userConnections) {
      return;
    }

    userConnections.delete(socket);

    if (userConnections.size === 0) {
      this.connections.delete(socket.userId);
    }
  }

  get(userId: number) {
    return this.connections.get(userId);
  }

  sendToUser(userId: number, data: unknown) {
    const userConnections = this.connections.get(userId);

    if (!userConnections) {
      return;
    }

    const message = JSON.stringify(data);

    for (const socket of userConnections) {
      if (socket.readyState === socket.OPEN) {
        socket.send(message);
      }
    }
  }

  has(userId: number) {
    return this.connections.has(userId);
  }
}

export const connectionManager = new ConnectionManager();