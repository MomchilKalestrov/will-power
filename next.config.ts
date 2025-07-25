import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            
        }
    },
    images: {
        remotePatterns: [ new URL('https://5r8xi2igslacumom.public.blob.vercel-storage.com/**') ]
    }
};

export default nextConfig;
