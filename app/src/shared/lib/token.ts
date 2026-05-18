import jwt from "jsonwebtoken"
import { env } from "../config/env";
import crypto from "crypto";


export const generateAccessToken = (id: string) => {
  return jwt.sign(
    { id , jti: crypto.randomUUID()},
    env.accessTokenSecret,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (id: string) => {
  return jwt.sign(
    { id, jti: crypto.randomUUID() },
    env.refreshTokenSecret,
    { expiresIn: "30d" }
  );
};

export const verifyRefreshToken = (token: string)  => {
  return jwt.verify(token, env.refreshTokenSecret) as {id: number; iat: number; exp: number };
};
