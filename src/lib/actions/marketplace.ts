// Not a file with server actions, but I still wanted it to feel as such.
import z from 'zod';

const basePluginDataSchema =
    z.object({
        name: z.string(),
        iconUrl: z.string(),
        downloadUrl: z.string(),
        version: z.string().regex(/^\d{2}\.\d{2}\.\d{2}$/, 'Version must me formatted as `XX.XX.XX`.')
    });

const pluginsResponseSchema = z.array(basePluginDataSchema);

const pluginResponseSchema = basePluginDataSchema.extend({
    description: z.string(),
    author: z.string()
});

const authorResponseSchema = z.object({
    name: z.string(),
    verified: z.boolean(),
    pictureUrl: z.string(),
    plugins: z.array(z.string())
});

const URL = process.env.NEXT_PUBLIC_MARKETPLACE_URL ?? 'https://localhost:8080';

export const getPlugins = async (
    page: number = 0,
    count: number = 10
): serverActionResponse<z.infer<typeof pluginsResponseSchema>> => {
    const skip = page * count;
    
    try {
        const response = await fetch(URL + '/api/get-plugins', {
            body: JSON.stringify({ skip, count }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok)
            return {
                success: false,
                reason: `Error ${ response.status }.`
            };
        
        return {
            success: true,
            value: pluginsResponseSchema.parse(await response.json())
        };
    } catch (error) {
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

export const getPluginsByQuery = async (
    query: string,
    page: number = 0,
    count: number = 10
): serverActionResponse<z.infer<typeof pluginsResponseSchema>> => {
    const skip = page * count;

    try {
        const response = await fetch(URL + '/api/get-plugins-by-query', {
            body: JSON.stringify({ query, skip, count }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok)
            return {
                success: false,
                reason: `Error ${ response.status }.`
            };
        
        return {
            success: true,
            value: pluginsResponseSchema.parse(await response.json())
        };
    } catch (error) {
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

export const getPlugin = async (
    name: string
): serverActionResponse<z.infer<typeof pluginResponseSchema>> => {
    try {
        const response = await fetch(URL + '/api/get-plugin', {
            body: JSON.stringify({ name }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok)
            return {
                success: false,
                reason: `Error ${ response.status }.`
            };
        
        return {
            success: true,
            value: pluginResponseSchema.parse(await response.json())
        };
    } catch (error) {
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

export const getAuthor = async (
    name: string
): serverActionResponse<z.infer<typeof authorResponseSchema>> => {
    try {
        const response = await fetch(URL + '/api/get-author', {
            body: JSON.stringify({ name }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok)
            return {
                success: false,
                reason: `Error ${ response.status }.`
            };
        
        return {
            success: true,
            value: authorResponseSchema.parse(await response.json())
        };
    } catch (error) {
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};
