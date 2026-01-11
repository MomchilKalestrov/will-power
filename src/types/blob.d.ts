import { type Readable } from 'stream';
import type { PutCommandOptions, ListBlobResultBlob } from '@vercel/blob';

declare global {
    type BlobInformation = ListBlobResultBlob;

    type BlobPutBody = string | Readable | Buffer | Blob | ArrayBuffer | ReadableStream | File;

    type BlobPutOptions = PutCommandOptions;

    interface BlobStorageAdapter {
        getBlobList: () => Promise<BlobInformation[]>;
        addBlob: (path: string, body: BlobPutBody, options: BlobPutCommandOptions) => Promise<BlobInformation>;
        existsBlob: (path: string) => Promise<boolean>;
        deleteBlob: (path: string) => Promise<void>;
    };
};

export {};