import z from 'zod';

import { pluginMetadataSchema } from '@/lib/zod/pluginSchemas';

export const configSchema = z.object({
    theme: z.string(),
    themes: z.array(z.string()),
    fonts: z.array(
        z.object({
            family: z.string(),
            url: z.string()
        })
    ),
    variables: z.array(
        z.union([
            z.object({
                type: z.literal('font'),
                id: z.string(),
                name: z.string(),
                family: z.string(),
                style: z.enum([ 'normal', 'italic' ]),
                size: z.string(),
                weight: z.enum([ 'normal', 'bold', 'lighter', 'bolder' ]),
                fallback: z.enum([ 'serif', 'sans-serif', 'monospace', 'cursive' ])
            }),
            z.object({
                type: z.literal('color'),
                id: z.string(),
                name: z.string(),
                color: z
                    .string()
                    .regex(
                        /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
                        { message: 'The value is not a valid hex color code.' }
                    )
            })
        ])
    ),
    plugins: z.array(
        pluginMetadataSchema.extend({
            enabled: z.boolean()
        })
    )
});

export const updateConfigSchema = configSchema.partial();