import { MessageResponse } from "@/src/shared/config/type"
import { TwitRepository } from "./twit.repository"
import { Twit, TwitCreate, UserId } from "./twit.type"



const twitRepository = new TwitRepository()
export class TwitService {
    async createTwit( { userId, content }: TwitCreate ): Promise<MessageResponse>{
        return await twitRepository.create({ userId, content })
    }
    async getAll({id}: UserId): Promise<Twit[]>{
        return await twitRepository.getAll({id})
    }
}