import { z } from 'zod';

export const signInSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform((v) => v.trim()),
  otp: z.string().optional(),
});

export type SignInSchema = z.infer<typeof signInSchema>;
