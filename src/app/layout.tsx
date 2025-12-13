import React from 'react';
import { Toaster } from 'sonner';
import { ComponentsProvider } from '@/contexts/components';
//@ts-ignore
import './globals.css';
import { ConfigProvider } from '@/contexts/config';
import { PluginsProvider } from '@/contexts/plugins';
import { FileSelectorProvider } from '@/components/fileSelector';

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
    <html lang='en'>
        <head>
            <link rel='stylesheet' href='/api/css/theme' crossOrigin='anonymous' />
            <link rel='stylesheet' href='/api/css/custom' />
            <script
                type='importmap'
                dangerouslySetInnerHTML={ {
                    __html: JSON.stringify({
                        imports: {
                            'plugins/': `${ process.env.NEXT_PUBLIC_BLOB_URL }/plugins/`
                        }
                    })
                } }
            />
        </head>
        <body>
            <Toaster />
            <FileSelectorProvider>
                <ConfigProvider>
                    <PluginsProvider>
                        <ComponentsProvider>
                            { children }
                        </ComponentsProvider>
                    </PluginsProvider>
                </ConfigProvider>
            </FileSelectorProvider>
        </body>
    </html>
);

export default RootLayout;

