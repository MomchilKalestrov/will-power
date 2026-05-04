import { type Readable } from 'stream';
import type { PutCommandOptions, ListBlobResultBlob } from '@vercel/blob';

declare global {
    type BlobInformation = {
        pathname: string;
        url: string;
        size: number;
        uploadedAt: Date;
    };

    type BlobPutBody = string | Readable | Buffer | Blob | ArrayBuffer | ReadableStream | File;

    type BlobPutOptions = PutCommandOptions;

    interface BlobStorageAdapter {
        type: string;
        getBlob: (path: string) => Promise<Uint8Array<ArrayBuffer> | null>;
        getBlobList: () => Promise<BlobInformation[]>;
        addBlob: (path: string, body: BlobPutBody, options: BlobPutCommandOptions) => Promise<BlobInformation>;
        existsBlob: (path: string) => Promise<boolean>;
        deleteBlob: (path: string) => Promise<void>;
    };
};

export {};