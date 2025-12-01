'use server';
import z from 'zod';
import AdmZip from 'adm-zip';
import mongoose from 'mongoose';

import * as actions from '@/lib/actions';
import { hasAuthority } from '@/lib/utils';
import { pluginMetadataSchema } from '@/lib/zodSchemas';
import { type plugin, setConfig, getConfig } from '@/lib/config';

import connect from '@/lib/db';
import { getCurrentUser } from '@/lib/db/actions';

const isAuthenticated = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    return !!user && hasAuthority(user.role, 'admin', 0);
};

export const addPlugin = async (data: FormData): Promise<plugin | string> => {
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

    for (const file of archive.getEntries())
        if (!file.entryName.endsWith('/')) {
            const data = archive.readAsText(file);
            await actions.addBlob(`/plugins/${ metadata.name }/${ file.entryName }`, data, {
                access: 'public'
            });
        };
    
    const { plugins } = await getConfig();

    setConfig({
        plugins: [
            ...plugins,
            { ...metadata, enabled: true }
        ]
    });

    return ({ ...metadata, enabled: true });
};

export const removePlugin = async (name: string): Promise<string | boolean> => {
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

export const togglePlugin = async (name: string): Promise<string | boolean> => {
    if (!await isAuthenticated())
        return 'This user does not have the required priviliges';

    const { plugins } = await getConfig();
    const index = plugins.findIndex(plugin => plugin.name === name);
    plugins[ index ].enabled = !plugins[ index ].enabled;

    setConfig({ plugins });

    return true;
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
): Promise<boolean> => {
    try {
        if (!await isAuthenticated())
            return false;

        const connection = (await connect()).connection.useDb('plugins');
        const collection = await connection.createCollection(name);

        collection.insertOne({
            privilidges: privilidgesSchema.parse(privilidges),
            privilidgesDocument: true
        });

        return true;
    } catch (error) {
        console.log('[pl] createCollection error: ', error);
        return false;
    };
};

export const deleteCollection = async (name: string): Promise<boolean> => {
    try {
        if (!await isAuthenticated())
            return false;
        
        const connection = (await connect()).connection.useDb('plugins');
        
        return await connection.collection(name).drop();
    } catch (error) {
        console.log('[pl] deleteCollection error: ', error);
        return false;
    };
};

export const readDocuments = async (
    collectionName: string,
    from: number | undefined,
    to: number | undefined
): Promise<boolean | any> => {
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(collection, 'read'))
            return false;
    
        const query = collection
            .find({})
            .skip(Number(from) ?? 0)
            .limit(Number(to) ?? 0);
        
        return JSON.parse(JSON.stringify(query));
    } catch (error) {
        console.log('[pl] readDocuments error: ', error);
        return false;
    };
};

export const createDocument = async (
    collectionName: string,
    document: any
): Promise<boolean> => {
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(collection, 'add'))
            return false;

        if ('privilidgesDocument' in document) return false;

        await collection.insertOne(document);

        return true;
    } catch (error) {
        console.log('[pl] createDocument error: ', error);
        return false;
    };
};

export const updateDocument = async (
    collectionName: string,
    document: any,
    condition: any
): Promise<boolean> => {
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(collection, 'update'))
            return false;

        if (
            'privilidgesDocument' in document ||
            'privilidgesDocument' in condition
        ) return false;

        await collection.updateOne(condition, document);

        return true;
    } catch (error) {
        console.log('[pl] createDocument error: ', error);
        return false;
    };
};

export const deleteDocument = async (
    collectionName: string,
    condition: any
) => {
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(collection, 'delete'))
            return false;
        if (!await canCompleteAction(collection, 'update'))
            return false;

        if ('privilidgesDocument' in condition)
            return false;

        await collection.deleteOne(condition);

        return true;
    } catch (error) {
        console.log('[pl] deleteDocument error: ', error);
        return false;
    };
};