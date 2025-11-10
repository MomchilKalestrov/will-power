import React from 'react';
import { Metadata } from 'next';
//@ts-ignore
import '../globals.css';

export const metadata: Metadata = {
    title: 'Users'
};

export default ({ children }: { children: React.ReactNode }) => children;