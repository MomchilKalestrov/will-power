import 'server-only';
import z from 'zod';
import AdmZip from 'adm-zip';

import { hasAuthority } from '@/lib/utils';
import { addAuthInfo } from '@/lib/authenticateSSA';
import { themeMetadataSchema } from '@/lib/zod/themeSchemas';

import { addBlob, deleteBlob } from '@/lib/actions/blob/internal';
import { setConfig, getConfig } from '@/lib/actions/config.internal';

const isAuthorized = (user: User): boolean =>
    hasAuthority(user.role, 'admin', 0);

export const addTheme = addAuthInfo(async (user: User, data: FormData): serverActionResponse<z.infer<typeof themeMetadataSchema>> => {
    if (!isAuthorized(user))
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
            await addBlob(user, `/themes/${ metadata.name }/${ file.entryName }`, data, {
                access: 'public'
            });
        };
        
    const config = await getConfig();
    if (!config.success)
        return config;

    const response = await setConfig(user, { themes: [ ...config.value.themes, metadata.name ] });
    if (!response.success)
        return response;

    return {
        success: true,
        value: metadata
    };
}, 'strong');

export const removeTheme = addAuthInfo(async (user: User, name: string): serverActionResponse<boolean> => {
    if (!isAuthorized(user))
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    if (!await deleteBlob(user, `/theme/${ name }/*`))
        return {
            success: false,
            reason: 'Failed to delete the themes\'s directory.'
        };

    const config = await getConfig();
    if (!config.success)
        return config;

    return await setConfig(user, { themes: config.value.themes.filter(theme => theme !== name) });
}, 'strong');

export const selectTheme = addAuthInfo(async (user: User, name: string): serverActionResponse<boolean> => {
    if (!isAuthorized(user))
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

    return await setConfig(user, { theme: name });
}, 'strong');