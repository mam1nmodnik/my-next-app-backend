import { AuthenticatedWebSocket, WebSocketEvent } from "./types";
import { handleChatGet, handleChatList, handleChatStart, handleChatUnreadCount } from "./handlers/chat.hendler";
import { handleMessageSend, handleMarkAsRead } from "./handlers/message.hendler";

const handlers = {
  "chat.start": handleChatStart,
  "chat.list": handleChatList,
  "chat.get": handleChatGet,
  "chat.unreadCount": handleChatUnreadCount,

  "message.send": handleMessageSend,
  "message.markAsRead": handleMarkAsRead,

} as const;



export async function handleWebSocketEvent( 
  socket: AuthenticatedWebSocket,
  event: WebSocketEvent
) {
  
  if (!event || typeof event !== 'object') {
    return;
  }

  const handler = handlers[event.type as keyof typeof handlers];

  if (!handler) {
    socket.send(
      JSON.stringify({
        type: 'error',
        message: 'Invalid WebSocket event',
      }),
    );
    return;
  }

  return await handler(socket, event);
}