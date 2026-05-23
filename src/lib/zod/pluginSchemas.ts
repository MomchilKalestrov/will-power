import z from 'zod';

import { validName } from '@/lib/utils';
import { blockMetadataSchema } from '@/lib/zod/blockMetadataSchemas';

export const pluginMetadataSchema = z.object({
    name: z.string().refine(validName, { error: 'The plugin has an invalid filename.' }),
    version: z.string().regex(/^\d{2}\.\d{2}\.\d{2}$/, 'Version must me formatted as `XX.XX.XX`.')
});

export const pluginModuleSchema = z.object({
    components: z.array(
        z.object({
            Icon: z.function(),
            Component: z.function(),
            metadata: blockMetadataSchema.extend({
                name: z.string().refine(validName, { error: 'The component has an invalid name.' })
            })
        })
    ).optional(),
    pages: z.array(
        z.object({
            Component: z.function(),
            name: z.string().refine(validName, { error: 'The page has an invalid name.' }),
            showSidebar: z.boolean()
        })
    ).optional(),
    onLoad: z.function().optional(),
    onInstall: z.function().optional(),
    onDelete: z.function().optional()
});

export const pluginAPIResponseSchema = z.object({
    status: z.number().min(100).max(599),
    headers: z.record(z.string(), z.string()),
    body: z.any()
});