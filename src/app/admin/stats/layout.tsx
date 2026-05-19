import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
//@ts-ignore
import '../globals.css';

export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations('Admin.Stats');
    return { title: t('headerTitle') };
};

const Layout = ({ children }: { children: React.ReactNode }) => children;

export default Layout;