import { MessageResponse } from "@/src/shared/config/type";
import { AuthRepository } from "./auth.repository";
import { AuthResponse, LoginType, RegisterType, LogoutType, User } from "./auth.type";

const authRepository = new AuthRepository();

export class AuthService {

  async register({ email, login, password }: RegisterType): Promise<MessageResponse> {
    return authRepository.createUser({ email, login, password });
  }

  async login({ email, password }: LoginType): Promise<AuthResponse> {
    return authRepository.loginUser({ email, password });
  }

  async logout({id, refreshToken}: LogoutType): Promise<MessageResponse>{
    return authRepository.logoutUser({ id, refreshToken })
  }

  async thisUser(id: number): Promise<User> {
    return authRepository.thisUser(id);
  }

  async getPostsAll(id: number) {
    return authRepository.getPostsAll(id);
  }

}

