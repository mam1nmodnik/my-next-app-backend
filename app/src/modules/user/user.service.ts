import { UserRepository } from "./user.repository";
import { User, UserRecommended, UserSession } from "./user.type";


const userRepository = new UserRepository();
export class UserService {

  async thisUser(id: number): Promise<UserSession> {
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
  async follow(userId: number, targetId: number): Promise<{ message: string, status: number }> {
    return userRepository.follow(userId, targetId);
  }
  async unfollow(userId: number, targetId: number): Promise<{ message: string, status: number }> {
    return userRepository.unfollow(userId, targetId);
  }
  async user(id: number, sessionId: number): Promise<{ message: string, status: number } | User> {
    return userRepository.user(id, sessionId);
  }
}
