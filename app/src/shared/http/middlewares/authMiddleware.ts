import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/src/shared/config/env";

export interface AuthRequest extends Request {
  id?: number;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Нет токена" });
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Неверный формат токена" });
    }

    const decoded = jwt.verify(accessToken, env.accessTokenSecret) as { id: number };

    req.id = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Access token невалидный" });
  }
};
