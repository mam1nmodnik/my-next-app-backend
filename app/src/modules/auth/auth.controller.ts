import { Request, Router } from "express";
import { AuthService } from "./auth.service";
import { LoginType, RegisterType } from "./auth.type";
import { loginDto, registerDto, logoutDto, thisUserDto } from "./auth.dto";
import { authMiddleware, AuthRequest } from "@/src/shared/http/middlewares/authMiddleware";
import { prisma } from "@/src/shared/db/prisma";
import { get } from "node:http";

const router = Router();
const authService = new AuthService();

router.post("/login", async (req: Request<LoginType>, res, next) => {
  try {
    const validation = loginDto.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ message: validation.error.flatten().fieldErrors });
    }

    const login = await authService.login(validation.data);
    res.status(200).json(login);
  } catch (e) {
    next(e);
  }
});

router.post("/register", async (req: Request<RegisterType>, res, next) => {
  try {
    const validation = registerDto.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ message: validation.error.flatten().fieldErrors });
    }

    const register = await authService.register(validation.data);
    res.status(201).json(register);
  } catch (e) {
    next(e);
  }
});

router.patch("/logout", authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const validation = logoutDto.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: validation.error.flatten().fieldErrors });
    }

    const logout = await authService.logout({
      id: req.id!,
      refreshToken: validation.data.refreshToken,
    });

    res.status(200).json(logout);
  } catch (e) {
    next(e);
  }
});

router.get("/this-user", async (req, res, next) => {
  try {
    const idRaw = Number(req.query.id);
    const validation = thisUserDto.safeParse({ id: idRaw });

    if (!validation.success) {
      return res.status(400).json({ message: validation.error.flatten().fieldErrors });
    }

    const user = await authService.thisUser(validation.data.id);

    return res.status(200).json({ user });
  } catch (e) {
    next(e);
  }
});

router.get("/posts-all", async (req, res, next) => {
  try {
    const idRaw = Number(req.query.id);
    const validation = thisUserDto.safeParse({ id: idRaw });

    if (!validation.success) {
      return res.status(400).json({ message: validation.error.flatten().fieldErrors });
    }
    const posts = await authService.getPostsAll(validation.data.id);

    return res.status(200).json({ posts });

  } catch (e) {
    next(e);
  }
});

export const authRouter = router;
