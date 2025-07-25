'use server';
import { put, list } from '@vercel/blob';
import { z } from 'zod';

let _cachedBlobList: BlobInformation[] | undefined = [
  {
    url: 'https://5r8xi2igslacumom.public.blob.vercel-storage.com/HellYeah.png',
    downloadUrl: 'https://5r8xi2igslacumom.public.blob.vercel-storage.com/HellYeah.png?download=1',
    pathname: 'HellYeah.png',
    size: 9148,
    uploadedAt: new Date('2025-07-24T18:43:36.000Z')
  },
  {
    url: 'https://5r8xi2igslacumom.public.blob.vercel-storage.com/HellYeah.png',
    downloadUrl: 'https://5r8xi2igslacumom.public.blob.vercel-storage.com/HellYeah.png?download=1',
    pathname: 'Hell.png',
    size: 9148,
    uploadedAt: new Date('2025-07-24T18:43:36.000Z')
  },
  {
    url: 'https://5r8xi2igslacumom.public.blob.vercel-storage.com/HellYeah.png',
    downloadUrl: 'https://5r8xi2igslacumom.public.blob.vercel-storage.com/HellYeah.png?download=1',
    pathname: 'Yeah.png',
    size: 9148,
    uploadedAt: new Date('2025-07-24T18:43:36.000Z')
  },
  {
    url: 'https://5r8xi2igslacumom.public.blob.vercel-storage.com/config.json',
    downloadUrl: 'https://5r8xi2igslacumom.public.blob.vercel-storage.com/config.json?download=1',
    pathname: 'config.json',
    size: 19,
    uploadedAt: new Date('2025-07-17T07:20:49.000Z')
  }
];

const getBlobList = async (): Promise<BlobInformation[]> => {
    if (_cachedBlobList)
        return _cachedBlobList;
    
    try {
        const { blobs } = await list();
        _cachedBlobList = blobs;
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
        
        if (!_cachedBlobList)
            await getBlobList();
        _cachedBlobList!.push({
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