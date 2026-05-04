import { get, put, list, del, type ListBlobResult } from '@vercel/blob';

export const type = 'Vercel Blob Storage';

const getBlob = async (pathname: string): Promise<Uint8Array<ArrayBuffer> | null> => {
    const blob = await get(pathname, { access: 'public' });
    if (!blob?.stream) return null;

    const chunks: Uint8Array[] = [];

    const reader = blob.stream.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (value) chunks.push(value);
        if (done) break;
    }

    const totalLength = chunks.reduce((sum, c) => sum + c.byteLength, 0);
    const buf: Uint8Array<ArrayBuffer> = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        buf.set(chunk, offset);
        offset += chunk.byteLength;
    };

    return buf;
};

const getBlobList = async (): Promise<BlobInformation[]> => {
    const blobs: BlobInformation[] = [];
    let cursor: string | undefined = undefined;

    do {
        const res: ListBlobResult = await list({ cursor });
        blobs.push(...res.blobs);
        ({ cursor } = res);
    } while (cursor);
    
    return blobs;
};

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

export { getBlob, getBlobList, addBlob, existsBlob, deleteBlob };