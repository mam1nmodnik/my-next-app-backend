import { authMiddleware } from "@/src/shared/http/middlewares/authMiddleware";
import { Router } from "express";
import { TwitService } from "./twit.service";
import { createTwitDto, getAllTwiwDto } from "./twit.dto";

const router = Router();
const twitService = new TwitService();

router.post("/create", authMiddleware, async (req, res, next) => {
    try{ 
        const validation = createTwitDto.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const newTwit = await twitService.createTwit( validation.data )
        res.status(201).json(newTwit)
    } catch (e){
        next(e);
    }
})                           
router.get("/get", authMiddleware, async (req, res, next) => {
    try{
        const validation = getAllTwiwDto.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({ message: validation.error.flatten().fieldErrors });
        }
        const newTwit = await twitService.getAll(validation.data)
        
        res.status(201).json(newTwit)
    } catch (e){
        next(e);
    }
})                           

export const twitRouter = router    