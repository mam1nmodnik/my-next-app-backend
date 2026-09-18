import { createOrGetChat, getChatById, getUserChats } from "@/src/modules/chat/chat/chat.repository";
import {
  AuthenticatedWebSocket,
  WebSocketEvent,
} from "../types";
import { connectionManager } from "../connection.manager";
import { ChatWithUsers } from "@/src/modules/chat/chat/chat.type";
function getChatParticipant(
  chat: ChatWithUsers,
  userId: number,
) {
  return chat.user1Id === userId
    ? chat.user2
    : chat.user1;
}
export async function handleChatStart(
  socket: AuthenticatedWebSocket,
  event: WebSocketEvent,
) {
  const data = event.data as {
    userId?: number;
  };

  const participantId = data?.userId;

  if (!participantId) {
    socket.send(
      JSON.stringify({
        type: "chat.start.error",
        requestId: event.requestId,
        message: "User id is required",
      }),
    );

    return;
  }

  if (participantId === socket.userId) {
    socket.send(
      JSON.stringify({
        type: "chat.start.error",
        requestId: event.requestId,
        message:
          "Cannot create chat with yourself",
      }),
    );

    return;
  }

  const chat = await createOrGetChat(
    socket.userId,
    participantId,
  );

  /**
   * Пользователь, которого добавили в чат
   */
  const participant =
    chat.user1Id === socket.userId
      ? chat.user2
      : chat.user1;

  /**
   * ChatListItem для пользователя,
   * который создал чат
   */
  const chatForCurrentUser = {
    id: chat.id,

    user: {
      id: participant.id,
      login: participant.login,
      name: participant.name,
      avatar: participant.avatar,
    },

    lastMessage: null,

    updatedAt: chat.updatedAt,
    createdAt: chat.createdAt,

    unreadCount: 0,
  };

  /**
   * Отправляем ответ создателю чата
   */
  socket.send(
    JSON.stringify({
      type: "chat.start.success",
      requestId: event.requestId,
      data: chatForCurrentUser,
    }),
  );

  /**
   * Данные для второго пользователя.
   *
   * Для него participant — это текущий пользователь.
   */
  const chatForParticipant = {
    id: chat.id,

    user: {
      id: socket.userId,

      login: getChatParticipant(chat, socket.userId).login,

      name: getChatParticipant(chat, socket.userId).name,

      avatar: getChatParticipant(chat, socket.userId).avatar,
    },

    lastMessage: null,

    updatedAt: chat.updatedAt,
    createdAt: chat.createdAt,

    unreadCount: 0,
  };

  /**
   * Отправляем событие второму пользователю
   */
  connectionManager.sendToUser(
    participantId,
    {
      type: "chat.created",
      data: chatForParticipant,
    },
  );
}

export async function handleChatList(
  socket: AuthenticatedWebSocket,
  event: WebSocketEvent,
) {
  const userId = socket.userId;


  const chats = await getUserChats(userId);


  const result = chats.map((chat) => {
    const user =
      chat.user1Id === userId
        ? chat.user2
        : chat.user1;

    const lastMessage = chat.messages[0] ?? null;

    return {
      id: chat.id,

      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        avatar: user.avatar,
      },

      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isRead: lastMessage.isRead,
            isOwnMessage:
              lastMessage.authorId === userId,
          }
        : null,

      updatedAt: chat.updatedAt,
      createdAt: chat.createdAt,

      unreadCount: 0,
    };
  });

  socket.send(
    JSON.stringify({
      type: "chat.list.success",
      requestId: event.requestId,
      data: result,
    }),
  );
}

export async function handleChatGet(
  socket: AuthenticatedWebSocket,
  event: WebSocketEvent,
) {
  const data = event.data as {
    chatId?: number;
  };

  const chatId = data?.chatId;

  if (!chatId) {
    socket.send(
      JSON.stringify({
        type: "chat.get.error",
        requestId: event.requestId,
        message: "Chat id is required",
      }),
    );

    return;
  }

  const chat = await getChatById(
    chatId,
    socket.userId,
  );

  if (!chat) {
    socket.send(
      JSON.stringify({
        type: "chat.get.error",
        requestId: event.requestId,
        message: "Chat not found",
      }),
    );

    return;
  }

  socket.send(
    JSON.stringify({
      type: "chat.get.success",
      requestId: event.requestId,
      data: chat,
    }),
  );
}

export async function handleChatUnreadCount(
  socket: AuthenticatedWebSocket,
  event: WebSocketEvent,
) {}