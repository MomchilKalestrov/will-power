'use server';
import { put, list, del, PutCommandOptions } from '@vercel/blob';
import { Readable } from 'stream';

declare global {
    var cachedBlobList: BlobInformation[] | undefined;
};

type PutBody = string | Readable | Buffer | Blob | ArrayBuffer | ReadableStream | File;

const getBlobList = async (): serverActionResponse<BlobInformation[]> => {
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
    try {
        const size = body.toString().length;
        const uploadedAt = new Date();
        const blob = await put(path, body, options);
        
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