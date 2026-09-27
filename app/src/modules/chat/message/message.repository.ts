import { prisma } from "@/src/shared/db/prisma";


export async function getMessagesByChatId(
  chatId: number,
  userId: number,
  beforeId?: number,
) {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
  });

  if (!chat) {
    return null;
  }

  const messages = beforeId
    ? await prisma.message.findMany({
        where: { chatId },
        cursor: { id: beforeId },
        skip: 1,
        take: -30,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      })
    : await prisma.message.findMany({
        where: { chatId },
        take: 30,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });

  const orderedMessages = beforeId ? messages : messages.reverse();

  return {
    hasMore: orderedMessages.length === 30,
    messages: orderedMessages.map((message) => ({
      id: message.id,
      chatId: message.chatId,
      isOwnMessage: message.authorId === userId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      isRead: message.isRead,
    })),
  };
}

export async function markChatMessagesAsRead(chatId: number, userId: number) {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
  });

  if (!chat) return null;

  const unreadMessages = await prisma.message.findMany({
    where: { chatId, authorId: { not: userId }, isRead: false },
    select: { id: true, authorId: true },
  });

  if (unreadMessages.length === 0) {
    return { authorId: null, messageIds: [] as number[] };
  }

  const messageIds = unreadMessages.map(({ id }) => id);
  await prisma.message.updateMany({
    where: { id: { in: messageIds } },
    data: { isRead: true },
  });

  return { authorId: unreadMessages[0].authorId, messageIds };
}


export async function createMessage(
  chatId: number,
  authorId: number,
  content: string,
) {
  return prisma.message.create({
    data: {
      chatId,
      authorId,
      content,
    },
  });
}
