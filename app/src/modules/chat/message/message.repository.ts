import { prisma } from "@/src/shared/db/prisma";


export async function getMessagesByChatId(
  chatId: number,
  userId: number,
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

  const messages = await prisma.message.findMany({
    where: {
      chatId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return messages.map((message) => ({
    id: message.id,
    isOwnMessage: message.authorId === userId,
    content: message.content,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    isRead: message.isRead,
  }));
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