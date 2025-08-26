import type{ NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: false,
    redirects: () =>
        new Promise((resolve) =>
            resolve([
                {
                    source: '/admin/components',
                    destination: '/admin/components/page',
                    permanent: true
                }
            ])
        ),
    experimental: { serverActions: {} },
    images: {
        remotePatterns: [ new URL('https://5r8xi2igslacumom.public.blob.vercel-storage.com/**') ]
    }
};

export default nextConfig;
