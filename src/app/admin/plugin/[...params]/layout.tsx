import { Metadata } from 'next';
//@ts-ignore
import '../globals.css';

export const metadata: Metadata = {
    title: 'Plugin Page'
};

export default ({ children }: { children: React.ReactNode }) => children;