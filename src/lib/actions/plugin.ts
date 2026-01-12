'use server';
import AdmZip from 'adm-zip';

import { hasAuthority } from '@/lib/utils';
import { pluginMetadataSchema } from '@/lib/zodSchemas';

import { addBlob, deleteBlob } from '@/lib/actions/blob';
import { setConfig, getConfig } from '@/lib/actions/config';

import { getCurrentUser } from '@/lib/db/actions/user';

const isAuthenticated = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    return !!user && hasAuthority(user.role, 'admin', 0);
};

export const addPlugin = async (data: FormData): serverActionResponse<plugin> => {
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

    const plugin = data.get('plugin');
    if (!(plugin instanceof File))
        return {
            success: false,
            reason: 'Malformed data.'
        };
    
    const archive = new AdmZip(Buffer.from(await plugin.arrayBuffer()));
    const indexText = archive.readAsText('index.js');
    if (!indexText)
        return {
            success: false,
            reason: 'Missing `index.js`.'
        };

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

            await addBlob(`/plugins/${ metadata.name }/${ file.entryName }`, data, {
                access: 'public'
            });
        };
    
    const config = await getConfig();
    if (!config.success)
        return config;

    const response = await setConfig({
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
};

export const removePlugin = async (name: string): serverActionResponse<boolean> => {
    if (!await isAuthenticated())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    if (!(await deleteBlob(`/plugins/${ name }/*`)).success)
        return {
            success: false,
            reason: 'Failed to delete the plugin\'s directory.'
        };

    const config = await getConfig();
    if (!config.success)
        return config;

    const response = await setConfig({
        plugins: config.value.plugins.filter(plugin => plugin.name !== name)
    });
    if (!response.success)
        return response;

    return {
        success: true,
        value: true
    };
};

export const togglePlugin = async (name: string): serverActionResponse<boolean> => {
    if (!await isAuthenticated())
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

    setConfig({ plugins });

    return {
        success: true,
        value: true
    };
};