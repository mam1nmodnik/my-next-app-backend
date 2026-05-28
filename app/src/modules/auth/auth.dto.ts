import z from "zod";

export const registerDto = z.object({
  login: z.string().min(3, "Login must be at least 3 characters"),
  email: z.string().email({ pattern: z.regexes.unicodeEmail, message: "Invalid email address" }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginDto = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});


export const logoutDto = z.object({
  id: z.number(),
  refreshToken: z.string().min(1, "Refresh token is required"),
});
