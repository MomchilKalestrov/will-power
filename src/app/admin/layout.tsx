'use client';
import React from 'react';
import { SessionProvider } from 'next-auth/react';

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
    <SessionProvider>
        { children }
    </SessionProvider>
);

export default Layout;