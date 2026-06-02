import { MessageResponse } from "@/src/shared/config/type"
import { TwitRepository } from "./twit.repository"
import { TwitCreate, Twit, TwitLikeResult } from "./twit.type"


const twitRepository = new TwitRepository()
export class TwitService {
    
    async getAll(id?: number): Promise<Twit[]> {
        return await twitRepository.getAll(id)
    }
    async like(postId: number, userId: number): Promise<TwitLikeResult> {
        return await twitRepository.like(postId, userId)
    }
    async getMy(id: number): Promise<Twit[]> {
        return await twitRepository.getMy(id)
    }
    async create( { userId, content }: TwitCreate ): Promise<MessageResponse>{
        return await twitRepository.create({ userId, content })
    }
    async delete({ userId, postId }: { userId: number, postId: number }): Promise<MessageResponse> {
        return await twitRepository.delete({ userId, postId })
    }
    async getUserTwits(sessionId: number, userId: number): Promise<MessageResponse | Twit[]> {    
        return await twitRepository.getUserTwits(sessionId, userId)
    }
}
