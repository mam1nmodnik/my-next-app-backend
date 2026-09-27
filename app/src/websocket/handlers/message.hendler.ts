import { createMessage, getMessagesByChatId, markChatMessagesAsRead } from "@/src/modules/chat/message/message.repository";
import { WebSocketEvent , AuthenticatedWebSocket} from "../types";
import { prisma } from "@/src/shared/db/prisma";
import { connectionManager } from "../connection.manager";

export async function handleMessageSend(
  socket: AuthenticatedWebSocket,
  event: WebSocketEvent,
) {
  const data = event.data as {
    chatId?: number;
    content?: string;
  };

  const chatId = data?.chatId;
  const content = data?.content?.trim();

  if (!chatId || !content) {
    socket.send(
      JSON.stringify({
        type: "message.send.error",
        requestId: event.requestId,
        message: "Chat id and content are required",
      }),
    );

    return;
  }

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      OR: [
        { user1Id: socket.userId },
        { user2Id: socket.userId },
      ],
    },
  });

  if (!chat) {
    socket.send(
      JSON.stringify({
        type: "message.send.error",
        requestId: event.requestId,
        message: "Chat not found",
      }),
    );

    return;
  }

  const message = await createMessage(
    chatId,
    socket.userId,
    content,
  );

  const messageData = {
    id: message.id,
    chatId: message.chatId,
    isOwnMessage: true,
    content: message.content,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    isRead: message.isRead,
  };

  socket.send(
    JSON.stringify({
      type: "message.created",
      requestId: event.requestId,
      data: messageData,
    }),
  );

  const participantId =
    chat.user1Id === socket.userId
      ? chat.user2Id
      : chat.user1Id;

  connectionManager.sendToUser(
    participantId,
    {
      type: "message.created",
      data: {
        ...messageData,
        isOwnMessage: false,
      },
    },
  );
}
export async function handleMarkAsRead(
    socket: AuthenticatedWebSocket,
    event: WebSocketEvent
){
  const data = event.data as { chatId?: number };
  const chatId = data?.chatId;

  if (!chatId) return;

  const result = await markChatMessagesAsRead(chatId, socket.userId);
  if (!result) return;

  const readEvent = {
    type: "message.read",
    data: { chatId, messageIds: result.messageIds },
  };

  socket.send(JSON.stringify(readEvent));
  if (result.authorId !== null) {
    connectionManager.sendToUser(result.authorId, readEvent);
  }
}

export async function handleMessageGet(
  socket: AuthenticatedWebSocket,
  event: WebSocketEvent,
) {
  const data = event.data as {
    chatId?: number;
    beforeId?: number;
  };

  const chatId = data?.chatId;

  if (!chatId) {
    socket.send(
      JSON.stringify({
        type: "message.get.error",
        requestId: event.requestId,
        message: "Chat id is required",
      }),
    );

    return;
  }

  const messages = await getMessagesByChatId(
    chatId,
    socket.userId,
    data.beforeId,
  );

  if (!messages) {
    socket.send(
      JSON.stringify({
        type: "message.get.error",
        requestId: event.requestId,
        message: "Chat not found",
      }),
    );

    return;
  }

  socket.send(
    JSON.stringify({
      type: "message.get.success",
      requestId: event.requestId,
      data: { chatId, ...messages, beforeId: data.beforeId ?? null },
    }),
  );
}
