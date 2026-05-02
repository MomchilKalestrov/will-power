import 'server-only';
import AdmZip from 'adm-zip';

import { hasAuthority } from '@/lib/utils';
import { runInSandbox } from '@/lib/sandbox';
import { addAuthInfo } from '@/lib/authenticateSSA';
import { pluginMetadataSchema } from '@/lib/zodSchemas';

import { setConfig, getConfig } from '@/lib/actions/config.internal';
import { getBlob, addBlob, deleteBlob } from '@/lib/actions/blob/internal';

const isAuthorized = (user: User): boolean =>
    hasAuthority(user.role, 'admin', 0);

export const addPlugin = addAuthInfo(async (user: User, data: FormData): serverActionResponse<plugin> => {
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

    const plugin = data.get('plugin');
    if (!(plugin instanceof File))
        return {
            success: false,
            reason: 'Malformed data.'
        };
    
    const archive = new AdmZip(Buffer.from(await plugin.arrayBuffer()));
    
    const metaText = archive.readAsText('metadata.json');
    const parseResult = pluginMetadataSchema.safeParse(JSON.parse(metaText));
    if (!parseResult.success)
        return {
            success: false,
            reason: 'Malformed metadata.'
        };

    const metadata = parseResult.data;

    for (const file of archive.getEntries())
        if (!file.entryName.endsWith('/')) {
            const data = archive.readFile(file);
            
            if (!data) {
                console.error('[plugins] addPlugin error: data is null.');
                continue;
            };

            await addBlob(user, `/plugins/${ metadata.name }/${ file.entryName }`, data, {
                access: 'public'
            });
        };
    
    const config = await getConfig();
    if (!config.success)
        return config;

    const response = await setConfig(user, {
        plugins: [
            ...config.value.plugins,
            { ...metadata, enabled: true }
        ]
    });
    if (!response.success)
        return response;

    return {
        success: true,
        value: { ...metadata, enabled: true }
    };
}, 'strong');

export const removePlugin = addAuthInfo(async (user: User, name: string): serverActionResponse<boolean> => {
    if (!isAuthorized(user))
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    if (!(await deleteBlob(user, `/plugins/${ name }/*`)).success)
        return {
            success: false,
            reason: 'Failed to delete the plugin\'s directory.'
        };

    const config = await getConfig();
    if (!config.success)
        return config;

    const response = await setConfig(user, {
        plugins: config.value.plugins.filter(plugin => plugin.name !== name)
    });
    if (!response.success)
        return response;

    return {
        success: true,
        value: true
    };
}, 'strong');

export const togglePlugin = addAuthInfo(async (user: User, name: string): serverActionResponse<boolean> => {
    if (!isAuthorized(user))
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    const config = await getConfig();
    if (!config.success)
        return config;

    const { plugins } = config.value;
    const index = plugins.findIndex(plugin => plugin.name === name);
    plugins[ index ].enabled = !plugins[ index ].enabled;

    setConfig(user, { plugins });

    return {
        success: true,
        value: true
    };
}, 'strong');

export const runPluginSSA = addAuthInfo(async (user: User, name: string, func: string, args: any): serverActionResponse<any> => {
    if (!isAuthorized(user))
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    const fileResponse = await getBlob(user, `plugins/${ name }/server.js`);
    if (!fileResponse.success) return fileResponse;
    const file = fileResponse.value;

    try {
        const result = await runInSandbox(user, file.toString(), func, args);

        return {
            success: true,
            value: result
        }
    } catch (error) {
        console.log('[plugin] runPluginSSA error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
}, 'strong');