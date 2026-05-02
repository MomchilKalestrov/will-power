'use client';
import React from 'react';

import { setConfig as setBackendConfig } from '@/lib/actions/config';

type ConfigProviderProps = {
    initialConfig: config;
};

const ClientConfigCTX = React.createContext<{
    config: config,
    updateConfig: (newConfig: Partial<config>, updateBackend?: boolean) => Promise<void>
} | undefined>(undefined);

const useClientConfig = () => {
    const value = React.useContext(ClientConfigCTX);
    if (!value) throw new Error('useConfig must be used within a ConfigProvider');
    return value;
};

const ClientConfigProvider: React.FC<React.PropsWithChildren<ConfigProviderProps>> = ({ initialConfig, children }) => {
    const [ config, setConfig ] = React.useState<config>(initialConfig);


    const updateConfig = React.useCallback(async (newConfig: Partial<config>, updateBackend: boolean = true) => {
        if (updateBackend)
            await setBackendConfig(newConfig);
        setConfig({ ...config!, ...newConfig });
    }, [ config ]);

    return (
        <ClientConfigCTX.Provider value={ { config, updateConfig } }>
            { children }
        </ClientConfigCTX.Provider>
    );
};

export { ClientConfigProvider, useClientConfig };