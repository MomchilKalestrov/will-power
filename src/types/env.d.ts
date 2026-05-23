declare namespace NodeJS {
    export interface ProcessEnv {
        MONGODB_URI: string;
        AUTH_SECRET: string;
        AUTH_SALT: string;
        AUTH_URL: string;
        BLOB_READ_WRITE_TOKEN: string;
        NEXT_PUBLIC_BLOB_URL?: string;
        NEXT_PUBLIC_MARKETPLACE_URL?: string;
    }
};