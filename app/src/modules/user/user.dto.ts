import z from "zod";

export const userIdDto = z.object({
    id: z.number().int().positive()
});

export const sessionIdDto = z.object({
    id: z.number().int().positive(),
    sessionId: z.number().int().positive()
});

export const userUpdateDto = z.object({
    name: z.string().min(1).max(100).optional(),
    bio: z.string().max(250).optional(),
    email: z.string().email().optional(),
    login: z.string().min(3).max(30).optional(),
    avatarPublicId: z.string().nullable().optional(),
    avatar: z.string().url().nullable().optional(),
});
