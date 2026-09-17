import jwt from "jsonwebtoken";
import { env } from "@/src/shared/config/env";

export function authenticateWebSocket(token: string): number {
  const decoded = jwt.verify(
    token,
    env.accessTokenSecret,
  ) as {
    id: string | number;
  };

  const userId = Number(decoded.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user id");
  }

  return userId;
}