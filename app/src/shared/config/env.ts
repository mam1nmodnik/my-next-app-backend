import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4200),
  databaseUrl: process.env.DATABASE_URL ?? "",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  accessTokenSecret:
    process.env.ACCESS_TOKEN_SECRET ??
    process.env.ACCESS_SECRET ??
    "dev-access-secret",
  refreshTokenSecret:
    process.env.REFRESH_TOKEN_SECRET ??
    process.env.REFRESH_SECRET ??
    "dev-refresh-secret",
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}
