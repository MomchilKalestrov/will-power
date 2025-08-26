'use client';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ConfigProvider } from '@/components/configProvider';

const getCookie = (key: string) => {
    let name = key + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    for (let pair of decodedCookie.split(';').map(v => v.trim()))
        if (pair.startsWith(name))
            return pair.substring(name.length);
    return '';
}

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    React.useEffect(() => {
        if (
            !window.location.href.includes('/admin/viewer/') &&
            getCookie('darkMode') === 'true'
        ) document.body.classList.add('dark')
    }, []);
    
    return (
        <ConfigProvider>
            <SessionProvider>
                { children }
            </SessionProvider>
        </ConfigProvider>
    );
};

export default Layout;