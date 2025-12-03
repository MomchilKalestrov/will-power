'use server';
import z from 'zod';
import AdmZip from 'adm-zip';

import { hasAuthority } from '@/lib/utils';
import { themeMetadataSchema } from '@/lib/zodSchemas';
import { addBlob, deleteBlob, setConfig, getConfig } from '@/lib/actions';

import { getCurrentUser } from '@/lib/db/actions';

const isAuthenticated = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    return !!user && hasAuthority(user.role, 'admin', 0);
};

export const addTheme = async (data: FormData): serverActionResponse<z.infer<typeof themeMetadataSchema>> => {
    if (!await isAuthenticated())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };
    
    if (!(data instanceof FormData))
        return {
            success: false,
            reason: 'Malformed data.'
        };

    const theme = data.get('theme');
    if (!(theme instanceof File))
        return {
            success: false,
            reason: 'Malformed data.'
        };
    
    const archive = new AdmZip(Buffer.from(await theme.arrayBuffer()));
    const indexText = archive.readAsText('index.css');
    if (!indexText)
        return {
            success: false,
            reason: 'Missing `index.css`.'
        };

    const metaText = archive.readAsText('metadata.json');
    const parseResult = themeMetadataSchema.safeParse(JSON.parse(metaText));
    if (!parseResult.success)
        return {
            success: false,
            reason: 'Malformed metadata.'
        };
    
    const metadata = parseResult.data;

    for (const file of archive.getEntries())
        if (!file.entryName.endsWith('/')) {
            const data = archive.readAsText(file);
            await addBlob(`/themes/${ metadata.name }/${ file.entryName }`, data, {
                access: 'public'
            });
        };
        
    const config = await getConfig();
    if (!config.success)
        return config;

    const response = await setConfig({ themes: [ ...config.value.themes, metadata.name ] });
    if (!response.success)
        return response;

    return {
        success: true,
        value: metadata
    };
};

export const removeTheme = async (name: string): serverActionResponse<boolean> => {
    if (!await isAuthenticated())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    if (!await deleteBlob(`/theme/${ name }/*`))
        return {
            success: false,
            reason: 'Failed to delete the themes\'s directory.'
        };

    const config = await getConfig();
    if (!config.success)
        return config;

    return await setConfig({ themes: config.value.themes.filter(theme => theme !== name) });
};

export const selectTheme = async (name: string): serverActionResponse<boolean> => {
    if (!await isAuthenticated())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    const config = await getConfig();
    if (!config.success)
        return config;
    if (!config.value.themes.includes(name))
        return {
            success: false,
            reason: 'Theme not found.'
        };

    return await setConfig({ theme: name });
};