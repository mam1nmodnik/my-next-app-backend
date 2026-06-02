import { AuthRequest, optionalAuthMiddleware } from "@/src/shared/http/middlewares/authMiddleware";
import { Router } from "express";
import { createTwitDto, sessionIdDto, twoIdTwitDto, getMyTwitsDtoId } from "./twit.dto";
import { TwitService } from "./twit.service";

const router = Router();
const twitService = new TwitService();




router.get("/get-my", optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
    try{
        const idRaw = Number(req.id);
        const validation = getMyTwitsDtoId.safeParse({ id: idRaw });

        if(!validation.success){
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const newTwit = await twitService.getMy(validation.data.id)
        
        res.status(200).json(newTwit)

    } catch (e){
        next(e);
    }
})
router.get("/get-all", async (req, res, next) => {
    try{
        const idRaw = req.query.id === undefined ? undefined : Number(req.query.id);
        const validation = sessionIdDto.safeParse({ id: idRaw });
        if(!validation.success){
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const newTwit = await twitService.getAll(validation.data.id)
        
        res.status(200).json(newTwit)

    } catch (e){
        next(e);
    }
})                           

router.post("/create", optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
    try{ 

        const validation = createTwitDto.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const userId = Number(req.id);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({ message: "Access token невалидный" });
        }
        const newTwit = await twitService.create({
            userId,
            content: validation.data.content,
        });
        res.status(201).json(newTwit)
    } catch (e){
        next(e);
    }
})

router.post("/delete", optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
    try{ 
        const postId = Number(req.body.postId);
        const idRaw = Number(req.id);

        const validation = twoIdTwitDto.safeParse({ id: postId, sessionId: idRaw });

        if(!validation.success){
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const userId = Number(req.id);
        
        const newTwit = await twitService.delete({
            userId,
            postId: validation.data.id,
        });
        res.status(200).json(newTwit)
    } catch (e){
        next(e);
    }
})


router.post("/like", optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
    try {
        const postId = Number(req.body.postId ?? req.body.id);
        const userId = Number(req.id);
        const validation = twoIdTwitDto.safeParse({ id: postId, sessionId: userId });
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const newTwit = await twitService.like(validation.data.id, validation.data.sessionId)
        
        res.status(200).json(newTwit)

    } catch (e) {
        next(e);
    }
})
router.get("/get-user", optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
    try {
        const userIdRaw = Number(req.query.userId ?? req.query.id);
        const sessionIdRaw = Number(req.id);
        const validation = twoIdTwitDto.safeParse({ id: userIdRaw, sessionId: sessionIdRaw });
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const newTwit = await twitService.getAll(validation.data.sessionId)
        
        res.status(200).json(newTwit)

    } catch (e) {
        next(e);
    }
})
export const twitRouter = router    
