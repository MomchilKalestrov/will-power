'use client';
import React from 'react';
import { getConfig, type config, setConfig as saveConfig } from '@/lib/config';

const ConfigCTX = React.createContext<{
    config?: config,
    updateConfig?: (newConfig: Partial<config>) => Promise<void>
}>({});

const useConfig = () => React.useContext(ConfigCTX);

const ConfigProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ config, setConfig ] = React.useState<config | undefined>();

    const updateConfig = async (newConfig: Partial<config>) => {
        await saveConfig(newConfig);
        setConfig({ ...config!, ...newConfig });
    };

    React.useEffect(() => {
        getConfig().then(setConfig);
    }, []);

    return (
        <ConfigCTX.Provider value={ { config,  updateConfig: config ? updateConfig : undefined } }>
            { children }
        </ConfigCTX.Provider>
    );
};

export { ConfigProvider, useConfig };