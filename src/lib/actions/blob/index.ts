'use server';
import { getCurrentUser } from '@/lib/db/actions/user';

declare global {
    var cachedBlobList: BlobInformation[] | undefined;
    var cachedAdapter: BlobStorageAdapter | undefined;
};

const getAdapter = async (): Promise<BlobStorageAdapter> => {
    if (global.cachedAdapter) return global.cachedAdapter;

    if (process.env.BLOB_READ_WRITE_TOKEN?.startsWith('vercel_blob_rw'))
        return global.cachedAdapter = await import('@/lib/actions/blob/adapters/vercel');

    throw new Error('No blob adapter available.');
};

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
        const adapter = await getAdapter();
        const blobs = await adapter.getBlobList();
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

const addBlob = async (path: string, body: BlobPutBody, options: BlobPutOptions): serverActionResponse<BlobInformation> => {
    if (!await getCurrentUser())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };
    
    try {
        const size = body.toString().length;
        const uploadedAt = new Date();

        const adapter = await getAdapter();
        const blob = await adapter.addBlob(path, body, options);
        
        if (!global.cachedBlobList)
            await adapter.getBlobList();
        
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
        const adapter = await getAdapter();
        const blobs = await adapter.getBlobList();
        
        if (path.endsWith('/'))
            return {
                success: true,
                value: blobs.some(b => b.pathname.startsWith(path))
            };
        
        return {
            success: true,
            value: blobs.some(b => b.pathname === path || b.pathname.startsWith(path + '/'))
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
        const adapter = await getAdapter();
        const blobs = await adapter.getBlobList();

        const toDelete = blobs.filter(b => b.pathname === path || b.pathname.startsWith(path));
        if (toDelete.length === 0)
            return {
                success: true,
                value: true
            };

        global.cachedBlobList = blobs.filter(b => !toDelete.some(d => d.pathname === b.pathname));
        
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