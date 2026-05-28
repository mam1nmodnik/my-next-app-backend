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

    const decoded = jwt.verify(accessToken, env.accessTokenSecret) as { id: string | number };
    const userId = Number(decoded.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({ message: "Access token невалидный" });
    }

    req.id = userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Access token невалидный" });
  }
};

export const optionalAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  return authMiddleware(req, res, next);
};
