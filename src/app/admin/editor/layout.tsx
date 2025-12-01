import React from 'react';
import { Metadata } from 'next';
//@ts-ignore
import '../globals.css';

export const metadata: Metadata = {
    title: {
        template: '%s | Editor',
        default: 'Editor'
    }
};

const Layout = ({ children }: { children: React.ReactNode }) => children;

export default Layout;