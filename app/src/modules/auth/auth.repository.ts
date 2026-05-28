import { HttpError } from "@/src/shared/http/errors/error";
import { prisma } from "../../shared/db/prisma";
import { AuthResponse, LogoutType, } from "./auth.type";
import { comparePassword, hashPassword } from "@/src/shared/lib/password";
import { MessageResponse } from "@/src/shared/config/type";
import { generateAccessToken, generateRefreshToken } from "@/src/shared/lib/token";

export class AuthRepository {
  async loginUser({email, password}: {email: string, password: string}): Promise<AuthResponse> {
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpError(401, "Пользователь не найден");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new HttpError(401, "Пароли не совпадают");
    }

    const accessToken = generateAccessToken(String(user.id));
    const refreshToken = generateRefreshToken(String(user.id));

    return {
      user: {
        id: user.id,
        login: user.login,
        email: user.email
      },
      accessToken,
      refreshToken,
    };
  }


  async createUser( {login, email, password}: {login: string, email: string, password: string } ): Promise<MessageResponse>{

    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      throw new HttpError(409, "Email уже существует");
    }
    
    const loginExists = await prisma.user.findUnique({ where: { login } });
    if (loginExists) {
      throw new HttpError(409, "Login уже существует");
    }

    const checkedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        email: email,
        login: login,
        password: checkedPassword,
      },
    });

    return { message: "Успешная регистрация" };
  }

  async logoutUser({id, refreshToken}: LogoutType): Promise<MessageResponse>{

    return { message: "Logged out successfully" };

  } 


}
