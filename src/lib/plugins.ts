'use server';
import AdmZip from 'adm-zip';
import z from 'zod';
import { type plugin, setConfig, getConfig } from '@/lib/config';
import { hasAuthority, validName } from '@/lib/utils';
import * as actions from '@/lib/actions';
import { getCurrentUser } from '@/lib/db/actions';
import { pluginMetadataSchema } from '@/lib/zodSchemas';

const isAuthenticated = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    return !!user && hasAuthority(user.role, 'admin', 0);
};

const addPlugin = async (data: FormData): Promise<plugin | string> => {
    if (!(data instanceof FormData)) return 'The parameter is not a FormData object';

    if (!await isAuthenticated())
        return 'This user does not have the required priviliges';

    const plugin = data.get('plugin') as File;
    if (!plugin) return 'Could not get plugin blob from form data';
    
    const archive = new AdmZip(Buffer.from(await plugin.arrayBuffer()));
    const indexText = archive.readAsText('index.js');
    if (!indexText) return 'Could not find `index.js`';
    
    const metaText = archive.readAsText('metadata.json');
    const parseResult = pluginMetadataSchema.safeParse(JSON.parse(metaText));
    if (!parseResult.success) return 'Could not parse plugin metadata';
    const metadata = parseResult.data;

    await actions.addBlob(`/plugins/${ metadata.name }/metadata.json`, metaText, {
        access: 'public'
    });
    await actions.addBlob(`/plugins/${ metadata.name }/index.js`, indexText, {
        access: 'public'
    });
    
    const { plugins } = await getConfig();

    setConfig({
        plugins: [
            ...plugins,
            { ...metadata, enabled: true }
        ]
    });

    return ({ ...metadata, enabled: true });
};

const removePlugin = async (name: string): Promise<string | boolean> => {
    if (!await isAuthenticated())
        return 'This user does not have the required priviliges';

    if (!await actions.deleteBlob(`/plugins/${ name }/*`))
        return 'Failed to delete the plugin\'s directory';

    const { plugins } = await getConfig();

    setConfig({
        plugins: plugins.filter(plugin => plugin.name !== name)
    });

    return true;
};

const togglePlugin = async (name: string): Promise<string | boolean> => {
    if (!await isAuthenticated())
        return 'This user does not have the required priviliges';

    let { plugins } = await getConfig();
    const index = plugins.findIndex(plugin => plugin.name === name);
    plugins[ index ].enabled = !plugins[ index ].enabled;

    setConfig({ plugins });

    return true;
};

export {
    addPlugin,
    removePlugin,
    togglePlugin
};