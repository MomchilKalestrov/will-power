import React from 'react';
import { Metadata, NextComponentType, NextPageContext } from 'next';
//@ts-ignore
import '../globals.css';
import AddThemeDialog from './addThemeDialog';

export const metadata: Metadata = {
    title: 'Themes'
};

const Layout: NextComponentType<NextPageContext, unknown, LayoutProps<'/admin/themes'>> = ({
    children
}) => (
    <>
        <header className='h-16 px-4 border-b bg-background flex justify-between items-center gap-4'>
            <h2 className='font-bold text-xl'>Installed Themes</h2>
            <AddThemeDialog />
        </header>
        { children }
    </>
);

export default Layout;