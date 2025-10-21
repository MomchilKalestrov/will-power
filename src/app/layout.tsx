import { Toaster } from 'sonner';
import { ComponentDbProvider } from '@/components/componentDb';
//@ts-ignore
import './globals.css';

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
    <html lang='en'>
        <head>
            <link rel="stylesheet" href="/api/css/theme" />
            <link rel="stylesheet" href="/api/css/custom" />
        </head>
        <body>
            <Toaster />
            <ComponentDbProvider>
                { children }
            </ComponentDbProvider>
        </body>
    </html>
);

export default RootLayout;

