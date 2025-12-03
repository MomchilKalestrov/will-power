'use client';
import React from 'react';
import { getConfig, setConfig as setBackendConfig } from '@/lib/actions';

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
    const [ config, setConfig ] = React.useState<config | undefined>();
    
    React.useEffect(() => {
        getConfig().then(response => {
            if (!response.success)
                return console.error('Error loading config: ' + response.reason);
            setConfig(response.value);
        });
    }, []);

    const updateConfig = React.useCallback(async (newConfig: Partial<config>, updateBackend: boolean = true) => {
        if (updateBackend) {
            await setBackendConfig(newConfig);
        };
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