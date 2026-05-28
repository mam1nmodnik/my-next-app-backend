import { UserRepository } from "./user.repository";
import { User, UserRecommended } from "./user.type";


const userRepository = new UserRepository();
export class UserService {

  async thisUser(id: number): Promise<User> {
    return userRepository.thisUser(id);
  }
   async recommended(id?: number): Promise<UserRecommended[]> {
    return userRepository.recommended(id);
  }
  async following(id: number, sessionId: number): Promise<UserRecommended[]> {
    return userRepository.following(id, sessionId);
  }
  async followers(id: number, sessionId: number): Promise<UserRecommended[]> {
    return userRepository.followers(id, sessionId);
  }
}
