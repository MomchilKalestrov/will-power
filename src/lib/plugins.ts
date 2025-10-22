'use server';
import AdmZip from 'adm-zip';
import z from 'zod';
import { type plugin, setConfig, getConfig } from './config';
import { getServerSession } from 'next-auth';
import { hasAuthority } from './utils';
import * as actions from './actions';

const metadataSchema = z.object({
    name: z.string(),
    version: z.string().regex(/^\d{2}\.\d{2}\.\d{2}$/, 'Version must me formatted as `XX.XX.XX`.')
});

const isAuthenticated = async (): Promise<boolean> => {
    const session = await getServerSession();
    console.log(session);
    if (hasAuthority('admin', 'editor'))
        return true;
    return false;
};

const addPlugin = async (data: FormData): Promise<plugin | string> => {
    if (!await isAuthenticated())
        return 'This user does not have the required priviliges';

    const plugin = data.get('plugin') as File;
    if (!plugin) return 'Could not get plugin blob from form data';
    
    const archive = new AdmZip(Buffer.from(await plugin.arrayBuffer()));
    const index = archive.readAsText('index.js');
    if (index) return 'Could not find `index.js`';
    const metaText = archive.readAsText('metadata.json');
    try { var metadata = metadataSchema.parse(JSON.parse(metaText)); }
    catch { return 'Could not parse plugin metadata' };
    
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
        return 'This user does not have the required priviliges ';


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