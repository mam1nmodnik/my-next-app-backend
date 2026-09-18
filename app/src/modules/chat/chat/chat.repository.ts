import { Chat, ChatWithUsers } from "./chat.type";
import { prisma } from "@/src/shared/db/prisma";

export async function getUserChats(userId: number): Promise<Chat[]> {
  return prisma.chat.findMany({
    where: {
      OR: [
        {
          user1Id: userId,
        },
        {
          user2Id: userId,
        },
      ],
    },

    include: {
      user1: {
        select: {
          id: true,
          login: true,
          name: true,
          avatar: true,
        },
      },

      user2: {
        select: {
          id: true,
          login: true,
          name: true,
          avatar: true,
        },
      },

      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          authorId: true,
          content: true,
          isRead: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });
}
export async function createOrGetChat(
  userId: number,
  participantId: number,
) : Promise<ChatWithUsers>{

  const user1Id = Math.min(userId, participantId);
  const user2Id = Math.max(userId, participantId);

  return prisma.chat.upsert({
    where: {
      user1Id_user2Id: {
        user1Id,
        user2Id,
      },
    },

    update: {},

    create: {
      user1Id,
      user2Id,
    },

    include: {
      user1: {
        select: {
          id: true,
          login: true,
          name: true,
          avatar: true,
        },
      },

      user2: {
        select: {
          id: true,
          login: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}


export async function getChatById(
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
    include: {
      user1: {
        select: {
          id: true,
          login: true,
          name: true,
          avatar: true,
        },
      },
      user2: {
        select: {
          id: true,
          login: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  if (!chat) {
    return null;
  }

  const participant =
    chat.user1Id === userId
      ? chat.user2
      : chat.user1;

  return {
    id: chat.id,
    participant: {
      id: participant.id,
      login: participant.login,
      name: participant.name,
      avatar: participant.avatar,
    },
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };
}