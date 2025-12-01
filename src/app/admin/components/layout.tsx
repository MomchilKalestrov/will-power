import React from 'react';
import { Metadata } from 'next';
//@ts-expect-error only because vscode requires this :/
import '../globals.css';

export const metadata: Metadata = {
    title: {
        template: '%s | Components',
        default: 'Components'
    }
};

const Layout = ({ children }: { children: React.ReactNode }) => children;

export default Layout;