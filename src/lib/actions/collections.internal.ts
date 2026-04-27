import 'server-only';
import z from 'zod';
import mongoose from 'mongoose';

import { hasAuthority } from '@/lib/utils';

import connect from '@/lib/db';

const canCompleteAction = async (
    user: User | undefined,
    collection: mongoose.Collection<any>,
    action: 'read' | 'add' | 'update' | 'delete'
): Promise<boolean> => {
    if (user) return true;
    const document = await collection.findOne({ privilidgesDocument: true });
    return document.privilidges.includes(action);
};

const isAuthorized = (user: User) =>
    hasAuthority(user.role, 'admin', 0)

const privilidgesSchema = z.array(z.enum([ 'read', 'add', 'update', 'delete' ]));

export const createCollection = async (
    user: User,
    name: string,
    privilidges: ('read' | 'add' | 'update' | 'delete')[]
): serverActionResponse<boolean> => {
    try {
        if (!isAuthorized(user))
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

export const deleteCollection = async (user: User, name: string): serverActionResponse<boolean> => {
    try {
        if (!user || !hasAuthority(user.role, 'admin', 0))
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
    user: User | undefined,
    collectionName: string,
    from: number | undefined,
    to: number | undefined
): serverActionResponse<any> => {
    if (typeof collectionName !== 'string')
        return {
            success: false,
            reason: 'Cannot omit `collectionName`.'
        };
    
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(user, collection, 'read'))
            return {
                success: false,
                reason: 'Unauthorized action.'
            };
    
        const query = await collection
            .find({})
            .skip(Number(from) || 0)
            .limit(Number(to) || 0)
            .toArray();
        
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
    user: User | undefined,
    collectionName: string,
    document: any
): serverActionResponse<boolean> => {
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(user, collection, 'add'))
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
    user: User | undefined,
    collectionName: string,
    document: any,
    condition: any
): serverActionResponse<boolean> => {
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(user, collection, 'update'))
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
    user: User | undefined,
    collectionName: string,
    condition: any
): serverActionResponse<boolean> => {
    try {
        const connection = (await connect()).connection.useDb('plugins');
        const collection = connection.collection(collectionName);

        if (!await canCompleteAction(user, collection, 'delete'))
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