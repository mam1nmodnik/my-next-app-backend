import { createOrGetChat, getUserChats } from "@/src/modules/chat/chat/chat.repository";
import {
  AuthenticatedWebSocket,
  WebSocketEvent,
} from "../types";


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
        message: "Cannot create chat with yourself",
      }),
    );

    return;
  }

  const chat = await createOrGetChat(
    socket.userId,
    participantId,
  );

  const user =
    chat.user1Id === socket.userId
      ? chat.user2
      : chat.user1;

  socket.send(
    JSON.stringify({
      type: "chat.start.success",
      requestId: event.requestId,
      data: {
        id: chat.id,

        user: {
          id: user.id,
          login: user.login,
          name: user.name,
          avatar: user.avatar,
        },

        lastMessage: null,

        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt,

        unreadCount: 0,
      },
    }),
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
) {}

export async function handleChatUnreadCount(
  socket: AuthenticatedWebSocket,
  event: WebSocketEvent,
) {}