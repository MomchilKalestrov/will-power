import React from 'react';
import { Metadata } from 'next';
//@ts-ignore
import '../globals.css';

export const metadata: Metadata = {
    title: 'Login'
};

export default ({ children }: { children: React.ReactNode }) => <React.Suspense>{ children }</React.Suspense>;