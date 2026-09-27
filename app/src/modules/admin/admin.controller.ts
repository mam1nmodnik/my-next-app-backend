import { Router } from "express";
import { z } from "zod";
import { prisma } from "@/src/shared/db/prisma";
import { hashPassword } from "@/src/shared/lib/password";
import {
  adminMiddleware,
  authMiddleware,
  AuthRequest,
} from "@/src/shared/http/middlewares/authMiddleware";

const router = Router();
const roleSchema = z.object({ role: z.enum(["USER", "ADMIN"]) });
const passwordSchema = z.object({ password: z.string().min(8).max(128) });
const pageSize = 50;

router.use(authMiddleware, adminMiddleware);

router.get("/users", async (req, res, next) => {
  try {
    const query = String(req.query.q ?? "").trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const where = query
      ? {
          OR: [
            { login: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
            { name: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          login: true,
          name: true,
          avatar: true,
          bio: true,
          date: true,
          createdAt: true,
          role: true,
          _count: { select: { followers: true, following: true, posts: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({ users, total, page, pageSize });
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:id/role", async (req: AuthRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = roleSchema.safeParse(req.body);
    if (!Number.isInteger(id) || id < 1 || !parsed.success) {
      return res.status(400).json({ message: "Некорректный пользователь или роль" });
    }

    if (id === req.id) {
      return res.status(400).json({ message: "Нельзя изменить собственную роль" });
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!target) return res.status(404).json({ message: "Пользователь не найден" });

    if (target.role === "ADMIN" && parsed.data.role === "USER") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return res.status(409).json({ message: "Нельзя снять роль у последнего администратора" });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
      select: { id: true, role: true },
    });

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:id/password", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = passwordSchema.safeParse(req.body);
    if (!Number.isInteger(id) || id < 1 || !parsed.success) {
      return res.status(400).json({ message: "Пароль должен содержать от 8 до 128 символов" });
    }

    const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return res.status(404).json({ message: "Пользователь не найден" });

    await prisma.user.update({
      where: { id },
      data: { password: await hashPassword(parsed.data.password) },
    });

    res.status(200).json({ message: "Пароль пользователя изменён" });
  } catch (error) {
    next(error);
  }
});

export const adminRouter = router;
