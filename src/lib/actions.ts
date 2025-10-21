'use server';
import { put, list, del, PutCommandOptions } from '@vercel/blob';
import { Readable } from 'stream';

declare global {
    var cachedBlobList: BlobInformation[] | undefined;
};

type PutBody = string | Readable | Buffer | Blob | ArrayBuffer | ReadableStream | File;

const getBlobList = async (): Promise<BlobInformation[]> => {
    if (global.cachedBlobList)
        return global.cachedBlobList;
    
    try {
        const { blobs } = await list();
        global.cachedBlobList = blobs;
        return blobs;
    } catch (error) {
        console.error('Error listing blobs:', error);
        return [];
    };
};

const addBlob = async (path: string, body: PutBody, options: PutCommandOptions): Promise<boolean> => {
    try {
        let blob = await put(path, body, options);
        
        if (!global.cachedBlobList)
            await getBlobList();
        global.cachedBlobList!.push({
            ...blob,
            size: body.toString().length,
            uploadedAt: new Date()
        });

        return true;
    } catch (error) {
        console.error('Error saving blobs: ', error);
        return false;
    };
};

const existsBlob = async (path: string): Promise<boolean> => {
    try {
        const blobs = await getBlobList();
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
        const toDelete = blobs.filter(b => b.pathname === path || b.pathname.startsWith(path));
        if (toDelete.length === 0) return true;

        await del(toDelete.map(blob => blob.pathname));

        global.cachedBlobList = (await getBlobList()).filter(b => !toDelete.some(d => d.pathname === b.pathname));
        return true;
    } catch (error) {
        console.error('[blobs] deleteBlob error:', error);
        return false;
    }
};

export { getBlobList, addBlob, existsBlob, deleteBlob };