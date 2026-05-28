import { MessageResponse } from "@/src/shared/config/type"
import { TwitRepository } from "./twit.repository"
import { TwitCreate, Twit, TwitLikeResult } from "./twit.type"


const twitRepository = new TwitRepository()
export class TwitService {
    async createTwit( { userId, content }: TwitCreate ): Promise<MessageResponse>{
        return await twitRepository.create({ userId, content })
    }
    async getAll(id?: number): Promise<Twit[]> {
        return await twitRepository.getAll(id)
    }
    async like(postId: number, userId: number): Promise<TwitLikeResult> {
        return await twitRepository.like(postId, userId)
    }
    async getMy(id: number): Promise<Twit[]> {
        return await twitRepository.getMy(id)
    }
}
