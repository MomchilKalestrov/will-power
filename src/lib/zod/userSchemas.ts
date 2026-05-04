import z from 'zod';

import { validName, validPassword } from '@/lib/utils';

export const userSchema = z.object({
    username: z
        .string()
        .refine(validName, { error: 'Username must contain only letters and underscores' }),
    password: z
        .preprocess(v =>
            (typeof v === 'string' && v.length !== 0)
            ?   v
            :   undefined,
            z
                .string()
                .refine(validPassword, { error: 'Password must be longer than 8 symbols, contain at least 2 characters and 1 special symbol' })
        ),
    role: z
        .enum([ 'editor', 'admin', 'owner' ])
});

export const updateUserSchema = userSchema.partial().extend({
    id: z.string().length(24)
});