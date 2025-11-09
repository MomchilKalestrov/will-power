'use client';
import React from 'react';
import ReactDom from 'react-dom';
import ReactJsxRuntime from 'react/jsx-runtime';

import type { plugin } from '@/lib/config';
import { useConfig } from '@/components/configProvider';
import * as actions from '@/lib/plugins';

class WP {
};

declare global {
    interface Window {
        WP: WP;
        React: typeof React;
        ReactDom: typeof ReactDom;
        ReactJsxRuntime: typeof ReactJsxRuntime;
    }
};

const PluginsCTX = React.createContext<{
    plugins: plugin[],
    addPlugin: ((plugin: Blob) => Promise<string>);
    removePlugin: ((name: string) => Promise<string>);
    togglePlugin: ((name: string) => Promise<string>);
}>({
    plugins: [],
    addPlugin: () => {
        throw new Error('There is no plugin Provider!');
    },
    removePlugin: () => {
        throw new Error('There is no plugin Provider!');
    },
    togglePlugin: () => {
        throw new Error('There is no plugin Provider!');
    }
});

const usePlugins = () => React.useContext(PluginsCTX);

const PluginsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { config, updateConfig } = useConfig();

    React.useEffect(() => {
        window.WP = Object.freeze(new WP());
        window.React = React;
        window.ReactDOM = ReactDom;
        window.ReactJsxRuntime = ReactJsxRuntime;
    }, []);

    const addPlugin = React.useCallback(async (plugin: Blob): Promise<string> => {
        const data = new FormData();
        data.append('plugin', plugin, 'plugin.zip');

        const response = await actions.addPlugin(data);
        
        if (typeof response === 'string')
            return `Error: ${ response }.`;

        updateConfig({
            plugins: [ ...config.plugins, response ]
        }, false);

        return 'Successfully added the plugin.';
    }, [ config, updateConfig ]);

    const removePlugin = React.useCallback(async (name: string): Promise<string> => {
        const response = await actions.removePlugin(name);

        if (typeof response === 'string')
            return `Error: ${ response }.`;

        updateConfig({
            plugins: config.plugins.filter(plugin => plugin.name !== name)
        }, false);
        
        return `${ name } has been deleted.`;
    }, [ config, updateConfig ]);

    const togglePlugin = React.useCallback(async (name: string): Promise<string> => {
        const response = await actions.togglePlugin(name);

        if (typeof response === 'string')
            return `Error: ${ response }.`;

        let newPlugins = [ ...config.plugins ];
        const index = newPlugins.findIndex(plugin => plugin.name === name);
        newPlugins[ index ].enabled = !newPlugins[ index ].enabled;

        updateConfig({ plugins: newPlugins }, false);

        return `${ name } has been toggled ${ newPlugins[ index ].enabled ? 'on' : 'off' }.`;
    }, [ config, updateConfig ]);

    return (
        <PluginsCTX.Provider value={ { addPlugin, removePlugin, togglePlugin, plugins: config.plugins } }>
            { children }
        </PluginsCTX.Provider>
    );
};

export { usePlugins, PluginsProvider };