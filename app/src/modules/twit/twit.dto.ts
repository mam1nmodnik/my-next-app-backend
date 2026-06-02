import z from "zod";

export const createTwitDto = z.object({
    content: z.string().min(1, "Текст слишком короткий!!").max(258, "Максимальное количество символов не более 258")
})

export const sessionIdDto = z.object({
    id: z.number().int().positive().optional()
})

export const twoIdTwitDto = z.object({
    id: z.number().int().positive(),
    sessionId: z.number().int().positive()
})
export const getMyTwitsDtoId = z.object({
    id: z.number().int().positive()
})