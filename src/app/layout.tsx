import React from 'react';
import { Toaster } from 'sonner';
import { ComponentDbProvider } from '@/components/componentDbProvider';
//@ts-ignore
import './globals.css';
import { ConfigProvider } from '@/components/configProvider';
import { PluginsProvider } from '@/components/pluginsProvider';
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
                        <ComponentDbProvider>
                            { children }
                        </ComponentDbProvider>
                    </PluginsProvider>
                </ConfigProvider>
            </FileSelectorProvider>
        </body>
    </html>
);

export default RootLayout;

