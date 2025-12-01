'use server';
import { put, list, del, PutCommandOptions } from '@vercel/blob';
import { Readable } from 'stream';

declare global {
    var cachedBlobList: BlobInformation[] | undefined;
};

type PutBody = string | Readable | Buffer | Blob | ArrayBuffer | ReadableStream | File;

const getBlobList = async (): Promise<BlobInformation[] | null> => {
    if (global.cachedBlobList)
        return global.cachedBlobList;
    
    try {
        const { blobs } = await list();
        global.cachedBlobList = blobs;
        return blobs;
    } catch (error) {
        console.error('[blobs] getBlobList error:', error);
        return null;
    };
};

const addBlob = async (path: string, body: PutBody, options: PutCommandOptions): Promise<BlobInformation | boolean> => {
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

        return { ...blob, size, uploadedAt };
    } catch (error) {
        console.error('[blobs] addBlob error: ', error);
        return false;
    };
};

const existsBlob = async (path: string): Promise<boolean> => {
    try {
        const blobs = await getBlobList();
        if (blobs === null) throw new Error('');
        if (path.endsWith('/'))
            return blobs.some(b => b.pathname.startsWith(path));
        return blobs.some(b => b.pathname === path || b.pathname.startsWith(path + '/'));
    } catch (error) {
        console.error('[blobs] existsBlob error:', error);
        return false;
    }
}

const deleteBlob = async (path: string): Promise<boolean> => {
    try {
        const blobs = await getBlobList();
        if (blobs === null) throw new Error('');
        const toDelete = blobs.filter(b => b.pathname === path || b.pathname.startsWith(path));
        if (toDelete.length === 0) return true;

        await del(toDelete.map(blob => blob.pathname));

        global.cachedBlobList = blobs.filter(b => !toDelete.some(d => d.pathname === b.pathname));
        return true;
    } catch (error) {
        console.error('[blobs] deleteBlob error:', error);
        return false;
    }
};

export { getBlobList, addBlob, existsBlob, deleteBlob };