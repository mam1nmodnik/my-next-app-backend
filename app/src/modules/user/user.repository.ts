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
  async   following(id: number, sessionId: number): Promise<UserRecommended[]> {

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
    try {
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
                        followerId: sessionId,
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
    catch (e) {
        console.error("Ошибка при получении подписчиков:", e);
        throw new HttpError(500, "Ошибка сервера при получении подписчиков");
    }
  }

  async follow(userId: number, sessionId: number): Promise<{ message: string, status: number }> {
    try {
      const res = await prisma.follow.create({
          data: {
            followerId: sessionId,
            followingId: userId,
          },
        });
        if (!res) {
          throw new HttpError(404, "Пользователь не найден");
        }
          
        return { message: "Подписка оформлена", status: 200 };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new HttpError(400, "Вы уже подписаны на этого пользователя");
      }
      console.error("Ошибка при оформлении подписки:", e);
      throw new HttpError(500, "Ошибка сервера при оформлении подписки");
    }
  }

  async unfollow(userId: number, sessionId: number): Promise<{ message: string, status: number }> {
    
      const res = await prisma.follow.deleteMany({
        where: {
          followerId: sessionId,
          followingId: userId,
        },
      });

      if (!res) {
        throw new HttpError(404, "Пользователь не найден");
      }
        
      return { message: "Подписка удалена", status: 200 };
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
