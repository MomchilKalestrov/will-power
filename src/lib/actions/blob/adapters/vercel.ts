'use server';
import { put, list, del } from '@vercel/blob';

const getBlobList = async (): Promise<BlobInformation[]> => (await list()).blobs;

const addBlob = async (path: string, body: BlobPutBody, options: BlobPutOptions): Promise<BlobInformation> => {
    const size = body.toString().length;
    const uploadedAt = new Date();
    
    const blob = await put(path, body, {
        ...options,
        allowOverwrite: true
    });

    return { ...blob, size, uploadedAt };
};

const existsBlob = async (path: string): Promise<boolean> => {
    const blobs = await getBlobList();

    return path.endsWith('/')
    ?   blobs.some(b => b.pathname.startsWith(path)) // if is a directory
    :   blobs.some(b => b.pathname === path || b.pathname.startsWith(path + '/')); // if is a file
};

const deleteBlob = async (path: string): Promise<void> => {
    const blobs = await getBlobList();

    const toDelete = blobs.filter(b => b.pathname === path || b.pathname.startsWith(path));
    if (toDelete.length !== 0)
        await del(toDelete.map(blob => blob.pathname));
};

export { getBlobList, addBlob, existsBlob, deleteBlob };