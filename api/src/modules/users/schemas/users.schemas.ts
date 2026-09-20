import { z } from 'zod';

export const registerSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string()
        .min(8, 'Must be at least 8 characters long')
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/[0-9]/, 'Must contain a number'),
});