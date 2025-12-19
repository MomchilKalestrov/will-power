'use server';
import { Readable } from 'stream';
import { put, list, del, type PutCommandOptions } from '@vercel/blob';

import { getCurrentUser } from '@/lib/db/actions';

declare global {
    var cachedBlobList: BlobInformation[] | undefined;
};

type PutBody = string | Readable | Buffer | Blob | ArrayBuffer | ReadableStream | File;

const getBlobList = async (): serverActionResponse<BlobInformation[]> => {
    if (!await getCurrentUser())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    if (global.cachedBlobList)
        return {
            success: true,
            value: global.cachedBlobList
        };
    
    try {
        const { blobs } = await list();
        global.cachedBlobList = blobs;
        return {
            success: true,
            value: blobs
        };
    } catch (error) {
        console.error('[blobs] getBlobList error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const addBlob = async (path: string, body: PutBody, options: PutCommandOptions): serverActionResponse<BlobInformation> => {
    if (!await getCurrentUser())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };
    
    try {
        const size = body.toString().length;
        const uploadedAt = new Date();
        const blob = await put(path, body, {
            ...options,
            allowOverwrite: true
        });
        
        if (!global.cachedBlobList)
            await getBlobList();
        
        global.cachedBlobList!.push({
            ...blob,
            size,
            uploadedAt
        });

        return {
            success: true,
            value: { ...blob, size, uploadedAt }
        };
    } catch (error) {
        console.error('[blobs] addBlob error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const existsBlob = async (path: string): serverActionResponse<boolean> => {
    if (!await getCurrentUser())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    try {
        const blobs = await getBlobList();
        if (!blobs.success)
            throw new Error(blobs.reason);
        
        if (path.endsWith('/'))
            return {
                success: true,
                value: blobs.value.some(b => b.pathname.startsWith(path))
            };
        
        return {
            success: true,
            value: blobs.value.some(b => b.pathname === path || b.pathname.startsWith(path + '/'))
        };
    } catch (error) {
        console.error('[blobs] existsBlob error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const deleteBlob = async (path: string): serverActionResponse<boolean> => {
    if (!await getCurrentUser())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    try {
        const blobs = await getBlobList();
        if (!blobs.success)
            throw new Error(blobs.reason);

        const toDelete = blobs.value.filter(b => b.pathname === path || b.pathname.startsWith(path));
        if (toDelete.length === 0)
            return {
                success: true,
                value: true
            };

        await del(toDelete.map(blob => blob.pathname));

        global.cachedBlobList = blobs.value.filter(b => !toDelete.some(d => d.pathname === b.pathname));
        
        return {
            success: true,
            value: true
        };
    } catch (error) {
        console.error('[blobs] deleteBlob error:', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

export { getBlobList, addBlob, existsBlob, deleteBlob };