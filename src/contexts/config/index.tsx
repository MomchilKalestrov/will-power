import React from 'react';

import { getConfig } from '@/lib/actions/config';

import { ClientConfigProvider, useClientConfig } from './provider';
import { getTranslations } from 'next-intl/server';

const ConfigProvider: React.FC<React.PropsWithChildren> = async ({ children }) => {
    const configResponse = await getConfig();
    const t = await getTranslations('Contexts');

    if (!configResponse.success)
        return (<p>{ t('fatalError') }</p>);

    return (
        <ClientConfigProvider initialConfig={ configResponse.value }>
            { children }
        </ClientConfigProvider>
    );
};

export { ConfigProvider, useClientConfig as useConfig };