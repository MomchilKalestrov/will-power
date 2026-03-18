import React from 'react';
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

import { ConfigProvider } from '@/contexts/config';
import { PluginsProvider } from '@/contexts/plugins';
import { ComponentsProvider } from '@/contexts/components';

//@ts-ignore
import './globals.css';

const RootLayout: React.FC<React.PropsWithChildren> = async ({ children }) => {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={ locale }>
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
                <NextIntlClientProvider locale={ locale } messages={ messages }>
                    <Toaster />
                    <ConfigProvider>
                        <PluginsProvider>
                            <ComponentsProvider>
                                { children }
                            </ComponentsProvider>
                        </PluginsProvider>
                    </ConfigProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
};

export default RootLayout;

