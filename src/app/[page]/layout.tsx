import React from 'react';
import { getConfig } from '@/lib/config';

const Layout: React.FC<React.PropsWithChildren> = async ({ children }) => (
    <>
        <link rel='stylesheet' href={ (await getConfig()).theme } />
        { children }
    </>
);

export default Layout;