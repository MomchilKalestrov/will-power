import { ComponentDbProvider } from '@/components/componentDb';
import './globals.css';

const RootLayout: React.FC<React.PropsWithChildren> = async ({ children }) => (
    <html lang='en'>
        <head>
            <link rel="stylesheet" href="/api/css/theme" />
            <link rel="stylesheet" href="/api/css/custom" />
        </head>
        <body>
            <ComponentDbProvider>
                { children }
            </ComponentDbProvider>
        </body>
    </html>
);

export default RootLayout;