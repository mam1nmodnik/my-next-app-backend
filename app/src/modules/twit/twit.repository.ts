import { MessageResponse } from "@/src/shared/config/type";
import { Twit, TwitCreate, UserId } from "./twit.type";
import { prisma } from "@/src/shared/db/prisma";
import { HttpError } from "@/src/shared/http/errors/error";


export class TwitRepository {
    
    async create( { userId, content }: TwitCreate ): Promise<MessageResponse> { 
        await prisma.post.create({
            data: {
                userId: parseInt(userId) , 
                content, 
            }
        }) 
        return { message: 'Twit create success'}
    }
    async getAll( { id }: UserId ): Promise<Twit[]>{
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, login: true, name: true, avatar: true },
                },
                likes: {
                    where: {
                        userId: parseInt(id),
                        isLiked: true,
                    },
                    select: {
                        id: true,
                    },
                },
            },
        });
        if(!posts){
            throw new HttpError(500, 'Ошибка получения постов')
        }
        const result = posts.map((post) => ({
            ...post,
            likesCount: post.likesCount,
            isLiked: post.likes.length > 0,
        }));

        return result
    }
}