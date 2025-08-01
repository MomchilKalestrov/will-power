'use server';
import { put, list } from '@vercel/blob';
import { z } from 'zod';

declare global {
    var cachedBlobList: BlobInformation[] | undefined;
}

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

const addBlobSchema = z.object({
    path: z.string().min(4),
    body: z.string(),
    options: z.any()    
});

const addBlob = async (path: string, body: string, options: any): Promise<boolean> => {
    const validateInput = addBlobSchema.safeParse({ path, body, options });

    if (!validateInput.success)
        return false;

    try {
        let blob = await put(path, body, options);
        
        if (!global.cachedBlobList)
            await getBlobList();
        global.cachedBlobList!.push({
            ...blob,
            size: body.length,
            uploadedAt: new Date()
        });

        return true;
    } catch (error) {
        console.log('Error saving blobs: ', error);
        return false;
    };
};

export { getBlobList, addBlob };