import React from 'react';
//@ts-ignore
import '../globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        template: '%s | Components',
        default: 'Components'
    }
};

export default ({ children }: { children: React.ReactNode }) => children;