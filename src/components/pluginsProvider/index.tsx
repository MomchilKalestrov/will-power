'use client';
import React from 'react';
import type { config, plugin } from '@/lib/config';
import { useConfig } from '@/components/configProvider';
import * as actions from '@/lib/plugins';


const PluginsCTX = React.createContext<{
    plugins: plugin[] | undefined,
    addPlugin: ((plugin: Blob) => Promise<string>) | undefined;
    removePlugin: ((name: string) => Promise<string>) | undefined;
    togglePlugin: ((name: string) => Promise<string>) | undefined;
}>({
    plugins: undefined,
    addPlugin: undefined,
    removePlugin: undefined,
    togglePlugin: undefined
});

const usePlugins = () => React.useContext(PluginsCTX);

const PluginsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { config, updateConfig } = useConfig();

    const addPlugin = React.useCallback(async (plugin: Blob): Promise<string> => {
        if (!config || !updateConfig) return 'Error: PluginsProvider is not wrapped in a ConfigProvider.';

        const data = new FormData();
        data.append('plugin', plugin, 'plugin.zip');

        const response = await actions.addPlugin(data);
        
        if (typeof response === 'string')
            return `Error: ${ response }.`;

        updateConfig({
            ...config,
            plugins: [ ...config.plugins, response ]
        }, false);

        return 'Successfully added the plugin!';
    }, [ config, updateConfig ]);

    const removePlugin = React.useCallback(async (name: string): Promise<string> => {
        if (!config || !updateConfig) return 'Error: PluginsProvider is not wrapped in a ConfigProvider.';

        const response = await actions.removePlugin(name);

        if (typeof response === 'string')
            return `Error: ${ response }.`;

        updateConfig({
            plugins: config.plugins.filter(plugin => plugin.name !== name)
        }, false);
        
        return 'I will never find peace.';
    }, [ config, updateConfig ]);

    const togglePlugin = React.useCallback(async (name: string): Promise<string> => {
        if (!config || !updateConfig) return 'Error: PluginsProvider is not wrapped in a ConfigProvider.';

        const response = await actions.togglePlugin(name);

        if (typeof response === 'string')
            return `Error: ${ response }.`;

        let { plugins } = JSON.parse(JSON.stringify(config)) as config;
        const index = plugins.findIndex(plugin => plugin.name === name);
        plugins[ index ].enabled = !plugins[ index ].enabled;
        console.log(plugins);

        updateConfig({ plugins }, false);

        return 'It hurts.';
    }, [ config, updateConfig ]);

    return (
        <PluginsCTX.Provider value={ { addPlugin, removePlugin, togglePlugin, plugins: config?.plugins } }>
            { children }
        </PluginsCTX.Provider>
    );
};

export { usePlugins, PluginsProvider };