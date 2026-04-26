declare namespace NodeJS {
    export interface ProcessEnv {
        MONGODB_URI: string;
        NEXTAUTH_URL: string;
        NEXTAUTH_SECRET: string;
        BLOB_READ_WRITE_TOKEN: string;
        NEXT_PUBLIC_BLOB_URL: string;
        NEXT_PUBLIC_MARKETPLACE_URL?: string;
    }
};