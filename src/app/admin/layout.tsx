'use client';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ConfigProvider } from '@/components/configProvider';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
    <ConfigProvider>
        <SessionProvider>
            { children }
        </SessionProvider>
    </ConfigProvider>
);

export default Layout;