import { MessageResponse } from "@/src/shared/config/type";
import { prisma } from "@/src/shared/db/prisma";
import { Twit, TwitCreate, TwitLikeResult } from "./twit.type";
import { Prisma } from "@/prisma/src/generated/prisma/client";
import { HttpError } from "@/src/shared/http/errors/error";


export class TwitRepository {
    
    
    async like(postId: number, userId: number): Promise<TwitLikeResult> {
        try {
            const result = await prisma.$transaction(async (prisma) => {
                const existing = await prisma.like.findUnique({
                    where: {

                        userId_postId: {
                            userId,
                            postId,
                        },
                    },
                });

                if (existing) {
                    await prisma.like.delete({
                        where: {
                            userId_postId: {
                                userId,
                                postId,
                            },
                        },
                    });

                    const post = await prisma.post.update({
                        where: { id: postId },
                        data: {
                            likesCount: { decrement: 1 },
                        },
                    });

                    return { post, liked: false };
                }

                await prisma.like.create({
                    data: {
                        userId,
                        postId,
                    },
                });

                const post = await prisma.post.update({
                    where: { id: postId },
                    data: {
                        likesCount: { increment: 1 },
                    },
                });

                return { post, liked: true };
            });

            return result
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                (error.code === "P2003" || error.code === "P2025")
            ) {
                throw new HttpError(404, "Пост не найден");
            }
            throw error;
        }
    }

    async getMy(id: number): Promise<Twit[]> {

        const posts = await prisma.post.findMany({
            where: { userId: id }, 
            orderBy: { createdAt: "desc" },
            include: {
            user: {
                select: { id: true, login: true, name: true, avatar: true },
            },
            likes: {
                where: {
                userId: id, 
                isLiked: true,  
                },
                select: {
                id: true, 
                },
            },
            },
        });
        
        const result = posts.map((post) => ({
        ...post,
        likesCount: post.likesCount,
        isLiked: post.likes.length > 0,
        }));

    return result
    }

    async getAll(id?: number): Promise<Twit[]> {

    const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { id: true, login: true, name: true, avatar: true },
            },
            likes: {
                where: {
                    userId: id || 0,
                    isLiked: true,
                },
                select: {
                    id: true,
                },
            },
        },
    });

    const result = posts.map((post) => ({
        ...post,
        likesCount: post.likesCount,
        isLiked: post.likes.length > 0,
    }));

        return result
    }

    async create( { userId, content }: TwitCreate ): Promise<MessageResponse> { 
        try {
            await prisma.post.create({
            data: {
                content,
                user: { connect: { id: userId } },
            },
            });

                return { message: 'Twit create success'}
        } catch (error) {
            if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2003"
            ) {
            return { message: 'User not found' }
            }

            return { message: 'Internal server error' };
        }
    }
    
    async delete({ userId, postId }: { userId: number, postId: number }): Promise<MessageResponse> {
        try {
            const post = await prisma.post.findUnique({
                where: { id: postId },
                select: { userId: true },
            });

            if (!post) {
                return { message: 'Post not found' };
            }

            if (post.userId !== userId) {
                return { message: 'No permission to delete this post' };
            }

            await prisma.post.delete({
                where: { id: postId },
            });

            return { message: 'Twit delete success' };
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2025"
            ) {
                return { message: 'Post not found' };
            }

            return { message: 'Internal server error' };
        }
    }
}
