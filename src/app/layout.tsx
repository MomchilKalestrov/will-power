import { Toaster } from 'sonner';
import { ComponentDbProvider } from '@/components/componentDbProvider';
//@ts-ignore
import './globals.css';
import { ConfigProvider } from '@/components/configProvider';
import { PluginsProvider } from '@/components/pluginsProvider';

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
    <html lang='en'>
        <head>
            <link rel="stylesheet" href="/api/css/theme" />
            <link rel="stylesheet" href="/api/css/custom" />
        </head>
        <body>
            <Toaster />
            <ConfigProvider>
                <PluginsProvider>
                    <ComponentDbProvider>
                        { children }
                    </ComponentDbProvider>
                </PluginsProvider>
            </ConfigProvider>
        </body>
    </html>
);

export default RootLayout;

