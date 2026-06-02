import { authMiddleware, AuthRequest, optionalAuthMiddleware } from "@/src/shared/http/middlewares/authMiddleware";
import { Router } from "express";
import { userIdDto, sessionIdDto } from "./user.dto";
import { UserService } from "./user.service";

const router = Router();

const userService = new UserService();        
router.get("/this-user", authMiddleware, async (req: AuthRequest, res, next) => {
    try {
        const idRaw = Number(req.id);
        const validation = userIdDto.safeParse({ id: idRaw });
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }

        const user = await userService.thisUser(validation.data.id);
        return res.status(200).json({ user });

    } catch (e) {
        next(e);
    }
});
router.get("/recommended", optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
    try{
        const users = await userService.recommended(req.id);
        return res.status(200).json({ users });

    } catch (e){
        next(e);
    }
})   

router.get("/followers", optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
    try {
        const idRaw = Number(req.query.id ?? req.query.userId);
        const sessionId = Number(req.id ?? 0);
        const validation = userIdDto.safeParse({ id: idRaw });
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const followers = await userService.followers(validation.data.id, sessionId);
        return res.status(200).json({ followers });

    } catch (e) {
        next(e);
    }
})
router.get("/following", optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
    try {        
        const id = Number(req.query.id ?? req.query.userId);
        const sessionId = Number(req.id ?? 0);
        const validation = userIdDto.safeParse({ id: id });
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const following = await userService.following(validation.data.id, sessionId);
        return res.status(200).json({ following });

    } catch (e) {
        next(e);
    }
})
router.post("/follow", authMiddleware, async (req: AuthRequest, res, next) => {
    try {
        const targetId = Number(req.body.id);
        const sessionId = Number(req.id);
        const validation = userIdDto.safeParse({ id: targetId });
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const result = await userService.follow(sessionId, validation.data.id);
        return res.status(200).json(result);

    } catch (e) {
        next(e);
    }
})
router.post("/unfollow", authMiddleware, async (req: AuthRequest, res, next) => {
    try {
        const targetId = Number(req.body.id);
        const sessionId = Number(req.id);
        const validation = userIdDto.safeParse({ id: targetId });
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const result = await userService.unfollow(sessionId, validation.data.id);
        return res.status(200).json(result);

    } catch (e) {
        next(e);
    }
})

router.get("/user", authMiddleware, async (req: AuthRequest, res, next) => { 
    try {
        const idRaw = Number(req.query.id);
        const sessionId = Number(req.id);

        const validation = sessionIdDto.safeParse({ id: idRaw, sessionId });
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const user = await userService.user(validation.data.id, sessionId);
        if ("status" in user) {
            return res.status(user.status).json({ message: user.message });
        }
        return res.status(200).json({ user });
    }   catch (e) {
            next(e);
        }
})
export const userRouter = router;
