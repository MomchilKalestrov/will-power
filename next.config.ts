import type{ NextConfig } from 'next';

const nextConfig: NextConfig = {
    redirects: () =>
        new Promise((resolve) =>
            resolve([
                {
                    source: '/admin/pages',
                    destination: '/admin/pages/pages',
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
