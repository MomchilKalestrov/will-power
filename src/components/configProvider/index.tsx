'use client';
import React from 'react';
import * as actions from '@/lib/config';
import { type config } from '@/lib/config';

const ConfigCTX = React.createContext<{
    config?: config,
    updateConfig?: (newConfig: Partial<config>, updateBackend?: boolean) => Promise<void>
}>({});

const useConfig = () => React.useContext(ConfigCTX);

const ConfigProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ config, setConfig ] = React.useState<config | undefined>();

    const updateConfig = async (newConfig: Partial<config>, updateBackend: boolean = true) => {
        if (updateBackend)    
            await actions.setConfig(newConfig);
        setConfig({ ...config!, ...newConfig });
    };

    React.useEffect(() => {
        actions.getConfig().then(setConfig);
    }, []);

    return (
        <ConfigCTX.Provider value={ { config,  updateConfig: config ? updateConfig : undefined } }>
            { children }
        </ConfigCTX.Provider>
    );
};

export { ConfigProvider, useConfig };