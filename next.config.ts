import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
    reactStrictMode: false,
    redirects: () => [
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
    ],
    images: {
        remotePatterns: [ {
            protocol: 'https',
            hostname: '**.vercel-storage.com/**'
        } ]
    },
    devIndicators: false,
    output: 'standalone',
    turbopack: { root: __dirname }
};

export default withNextIntl(nextConfig);
