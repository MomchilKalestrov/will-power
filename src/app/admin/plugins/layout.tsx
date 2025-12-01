import React from 'react';
import { Metadata } from 'next';
//@ts-ignore
import '../globals.css';

export const metadata: Metadata = {
    title: 'Plugins'
};

const Layout = ({ children }: { children: React.ReactNode }) => children;

export default Layout;