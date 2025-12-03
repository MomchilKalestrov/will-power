'use server';
import z from 'zod';
import AdmZip from 'adm-zip';
import mongoose from 'mongoose';

import { addBlob, deleteBlob, setConfig, getConfig } from '@/lib/actions';
import { hasAuthority } from '@/lib/utils';
import { pluginMetadataSchema } from '@/lib/zodSchemas';

import connect from '@/lib/db';
import { getCurrentUser } from '@/lib/db/actions';

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
            const data = archive.readAsText(file);
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

const canCompleteAction = async (
    collection: mongoose.Collection<any>,
    action: 'read' | 'add' | 'update' | 'delete'
): Promise<boolean> => {
    const user = await getCurrentUser();
    if (user) return true;
    const document = await collection.findOne({ privilidgesDocument: true });
    return document.privilidges.includes(action);
};

const privilidgesSchema = z.array(z.enum([ 'read', 'add', 'update', 'delete' ]));

export const createCollection = async (
    name: string,
    privilidges: ('read' | 'add' | 'update' | 'delete')[]
): serverActionResponse<boolean> => {
    try {
        if (!await isAuthenticated())
            return {
                success: false,
                reason: 'Unauthorized action.'
            };

        const connection = (await connect()).connection.useDb('plugins');
        const collection = await connection.createCollection(name);

        collection.insertOne({
            privilidges: privilidgesSchema.parse(privilidges),
            privilidgesDocument: true
        });

        return {
            success: true,
            value: true
        };
    } catch (error) {
        console.log('[plugins] createCollection error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

export const deleteCollection = async (name: string): serverActionResponse<boolean> => {
    try {
        if (!await isAuthenticated())
            return {
                success: false,
                reason: 'Unauthorized action.'
            };
        
        const connection = (await connect()).connection.useDb('plugins');
        
        const success = await connection.collection(name).drop();

        return success
        ?   { success, value: success }
        :   { success, reason: 'Failed to delete the collection' };
    } catch (error) {
        console.log('[plugins] deleteCollection error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

export const readDocuments = async (
    collectionName: string,
    from: number | undefined,
    to: number | undefined
): serverActionResponse<any> => {
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(collection, 'read'))
            return {
                success: false,
                reason: 'Unauthorized action.'
            };
    
        const query = collection
            .find({})
            .skip(Number(from) ?? 0)
            .limit(Number(to) ?? 0);
        
        return {
            success: true,
            value: JSON.parse(JSON.stringify(query))
        };
    } catch (error) {
        console.log('[plugins] readDocuments error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

export const createDocument = async (
    collectionName: string,
    document: any
): serverActionResponse<boolean> => {
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(collection, 'add'))
            return {
                success: false,
                reason: 'Unauthorized privilidges.'
            };

        if ('privilidgesDocument' in document)
            return {
                success: false,
                reason: 'Privilidges document cannot be altered.'
            };

        await collection.insertOne(document);

        return {
            success: true,
            value: true
        };
    } catch (error) {
        console.log('[plugins] createDocument error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

export const updateDocument = async (
    collectionName: string,
    document: any,
    condition: any
): serverActionResponse<boolean> => {
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(collection, 'update'))
            return {
                success: false,
                reason: 'Unauthorized action.'
            };

        if (
            'privilidgesDocument' in document ||
            'privilidgesDocument' in condition
        )
            return {
                success: false,
                reason: 'Privilidges document cannot be modified.'
            };

        await collection.updateOne(condition, document);

        return {
            success: true,
            value: true
        };
    } catch (error) {
        console.log('[plugins] createDocument error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

export const deleteDocument = async (
    collectionName: string,
    condition: any
): serverActionResponse<boolean> => {
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(collection, 'delete'))
            return {
                success: false,
                reason: 'Unauthorized action.'
            };

        if ('privilidgesDocument' in condition)
            return {
                success: false,
                reason: 'Privilidges document cannot be deleted.'
            };

        await collection.deleteOne(condition);

        return {
            success: true,
            value: true
        };
    } catch (error) {
        console.log('[plugins] deleteDocument error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};