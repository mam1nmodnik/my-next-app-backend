import z from "zod";

export const userIdDto = z.object({
    id: z.number().int().positive()
});

export const sessionIdDto = z.object({
    id: z.number().int().positive(),
    sessionId: z.number().int().positive()
});
