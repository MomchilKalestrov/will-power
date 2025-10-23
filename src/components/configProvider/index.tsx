'use client';
import React from 'react';
import * as actions from '@/lib/config';
import { type config } from '@/lib/config';

const ConfigCTX = React.createContext<{
    config: config,
    updateConfig: (newConfig: Partial<config>, updateBackend?: boolean) => Promise<void>
}>({
    config: null as unknown as config,
    updateConfig: () => {
        throw new Error('There is no config Provider!')
    }
});

const useConfig = () => React.useContext(ConfigCTX);

const ConfigProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ config, setConfig ] = React.useState<config | undefined>(undefined);
    
    React.useEffect(() => {
        actions.getConfig().then(setConfig);
    }, []);

    const updateConfig = React.useCallback(async (newConfig: Partial<config>, updateBackend: boolean = true) => {
        if (updateBackend)    
            await actions.setConfig(newConfig);
        setConfig({ ...config!, ...newConfig });
    }, [ config ]);

    if (!config) return (<></>);

    return (
        <ConfigCTX.Provider value={ { config, updateConfig } }>
            { children }
        </ConfigCTX.Provider>
    );
};

export { ConfigProvider, useConfig };