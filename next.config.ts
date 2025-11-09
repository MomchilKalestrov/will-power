import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: false,
    redirects: () =>
        new Promise((resolve) =>
            resolve([
                {
                    source: '/admin/components',
                    destination: '/admin/components/page',
                    permanent: true
                },
                {
                    source: '/admin',
                    destination: '/admin/home',
                    permanent: true
                },
                {
                    source: '/admin/editor',
                    destination: '/admin/home',
                    permanent: true
                },
                {
                    source: '/admin/viewer',
                    destination: '/admin/home',
                    permanent: true
                }
            ])
        ),
    images: {
        remotePatterns: [ new URL('https://5r8xi2igslacumom.public.blob.vercel-storage.com/**') ]
    },
    devIndicators: false
};

export default nextConfig;
