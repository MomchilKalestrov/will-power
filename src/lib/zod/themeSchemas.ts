import z from 'zod';

import { validName } from '@/lib/utils';

export const themeMetadataSchema = z.object({
    name: z.string().refine(validName, { error: 'The theme has an invalid filename.' })
});