import express from "express";
import { authRouter } from "./modules/auth/auth.controller";
import { errorMiddleware } from "./shared/http/middlewares/errorMiddleware";
import { twitRouter } from "./modules/twit/twit.controller";
import { env } from "./shared/config/env";
import { userRouter } from "./modules/user/user.controller";

const app = express();

export function createApp() {
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin === env.frontendUrl) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Vary", "Origin");
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  });

  app.use(express.json());
  
  app.use("/api/auth", authRouter);
  app.use("/api/post", twitRouter);
  app.use("/api/user", userRouter);


  app.use((req, res) => {
    res.status(404).json({
      error: {
        message: "Route not found",
      },
    });
  });
  
  app.use(errorMiddleware);

  return app;
}
