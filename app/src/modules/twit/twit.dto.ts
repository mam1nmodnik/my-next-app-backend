import z from "zod";

export const createTwitDto = z.object({
    userId: z.string().min(1),
    content: z.string().min(1, "Текст слишком короткий!!").max(258, "Максимальное количество символов не более 258")
})

export const getAllTwiwDto = z.object({
    id: z.string().min(1)
})