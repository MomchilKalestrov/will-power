import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Plugin Page'
};

export default ({ children }: { children: React.ReactNode }) => children;