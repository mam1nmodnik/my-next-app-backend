import { prisma } from "@/src/shared/db/prisma";
import { User, UserRecommended, UserSession } from "./user.type";
import { HttpError } from "@/src/shared/http/errors/error";
import { Prisma } from "@/prisma/src/generated/prisma/client";

export class UserRepository {

  async thisUser(id: number): Promise<UserSession> { 
      const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        login: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        date: true,
        avatarPublicId: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpError(404, "Пользователь не найден");

    }
    return user
  }


async recommended(id?: number): Promise<UserRecommended[]> { 
      const users = await prisma.user.findMany({
      take: 5,
      orderBy: {
        followers: { _count: 'desc' }, 
      },
      select: {
        id: true,
        login: true,
        avatar: true,
        name: true,
        followers: {
          where: {
            followerId: id || 0,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!users) {
      throw new HttpError(404, "Ошибка получении пользователей(");

    }
    const result = users.map((user) => ({
      id: user.id,
      login: user.login,
      name: user.name,
      avatar: user.avatar,
      isFollowedByMe: user.followers.length > 0,
    }));
    return result;
  }
  async following(id: number, sessionId: number): Promise<UserRecommended[]> {

    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        following: {
          select: {
            following: {
                select: {
                id: true,
                login: true,
                name: true,
                avatar: true,
                followers: {
                  where: {
                    followerId: sessionId || 0,
                  },
                }
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new HttpError(404, "Пользователь не найден");
    }

    const followers = user.following.map((f) => ({
      id: f.following.id,
      login: f.following.login,
      name: f.following.name,
      avatar: f.following.avatar,
      isFollowedByMe: f.following.followers.length > 0,
    }));

    return followers;
  }
  async followers(id: number, sessionId: number): Promise<UserRecommended[]> {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        followers: {
          select: {
            follower: {
                select: {
                id: true,
                login: true,
                name: true,
                avatar: true,
                followers: {
                  where: {
                    followerId: sessionId || 0,
                  },
                }
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new HttpError(404, "Ошибка получении пользователей(");
    }

    const followers = user.followers.map((f) => ({
      id: f.follower.id,
      login: f.follower.login,
      name: f.follower.name,
      avatar: f.follower.avatar,
      isFollowedByMe: f.follower.followers.length > 0,
    }));
    
    return followers;
  }

  async follow(followerId: number, followingId: number): Promise<{ message: string, status: number }> {
    try {
      await prisma.follow.create({
          data: {
            followerId,
            followingId,
          },
        });
          
        return { message: "Подписка оформлена", status: 200 };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return { message: "Вы уже подписаны на этого пользователя", status: 200 };
        }
        if (error.code === "P2003") {
          throw new HttpError(404, "Пользователь не найден");
        }
      }
      throw error;
    }
  }

  async unfollow(followerId: number, followingId: number): Promise<{ message: string, status: number }> {
    
      const res = await prisma.follow.deleteMany({
        where: {
          followerId,
          followingId,
        },
      });

      return {
        message: res.count > 0
          ? "Подписка удалена"
          : "Вы уже не подписаны на этого пользователя",
        status: 200,
      };
  }
    
  async user(id: number, sessionId: number): Promise<{ message: string, status: number } | User> {
    
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        login: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        avatarPublicId: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return { message: "Пользователь не найден", status: 404 };
    }

    let isFollowedByMe = false;

    if (sessionId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: sessionId,
            followingId: id,
          },
        },
      });

      isFollowedByMe = Boolean(follow);
    }

    return {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        avatarPublicId: user.avatarPublicId,
        _count: {
          followers: user._count.followers,
          following: user._count.following,
        },
        isFollowedByMe,
      }
  }
    
}
