'use client';
import type z from 'zod';
import React from 'react';
import { toast } from 'sonner';
import ReactDom from 'react-dom';
import ReactJsxRuntime from 'react/jsx-runtime';

import { useConfig } from '@/contexts/config';

import { pluginModuleSchema } from '@/lib/zodSchemas';

import * as pluginActions from '@/lib/actions/plugin';
import * as configActions from '@/lib/actions/config';

import * as componentActions from '@/lib/db/actions/component';


type pluginInstance = plugin & z.infer<typeof pluginModuleSchema>;

class WP {
    components: typeof componentActions;
    plugins: typeof pluginActions;
    config: typeof configActions;
    storageURL: URL;
    alert: (message: string) => void;

    constructor() {
        this.components = componentActions;
        this.plugins = pluginActions;
        this.config = configActions;
        this.storageURL = new URL(process.env.NEXT_PUBLIC_BLOB_URL!);
        this.alert = message =>
            window.location.pathname.startsWith('/admin')
            ?   toast(message)
            :   window.alert(message);
    };
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
    plugins: Map<string, pluginInstance>,
    addPlugin: ((plugin: Blob) => Promise<string>);
    removePlugin: ((name: string) => Promise<string>);
    togglePlugin: ((name: string) => Promise<string>);
} | undefined>(undefined);

const usePlugins = () => {
    const value = React.useContext(PluginsCTX);
    if (!value) throw new Error('usePlugins should be used within a PluginsProvider');
    return value;
};

const PluginsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { config, updateConfig } = useConfig();
    const [ plugins, setPlugins ] = React.useState<Map<string, pluginInstance>>();
    const [ pluginsToInstall, setPluginsToInstall ] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        window.WP = Object.freeze(new WP());
        window.React = React;
        window.ReactDOM = ReactDom;
        window.ReactJsxRuntime = ReactJsxRuntime;
    }, []);

    React.useEffect(() => {
        (async () => {
            const newState = new Map<string, pluginInstance>();

            for (const plugin of config.plugins)
                try {
                    const module = plugins?.has(plugin.name)
                    ?   plugins.get(plugin.name)!
                    :   await import(
                            /* webpackIgnore: true */
                            `plugins/${ plugin.name }/index.js`
                        );
                    var parsedModule = pluginModuleSchema.parse(module);

                    if (pluginsToInstall.has(plugin.name)) {
                        await parsedModule.onInstall?.();
                        setPluginsToInstall(state => {
                            const newState = new Set(state);
                            newState.delete(plugin.name);
                            return newState;
                        });
                    };
                    parsedModule.onLoad?.();
                    
                    newState.set(plugin.name, { ...plugin, ...parsedModule });

                } catch (error) {
                    console.error('Malformed plugin: ' + plugin.name, error);
                    newState.set(plugin.name, plugin);
                };
            
            setPlugins(newState);
        })();
    }, [ config.plugins ]);

    const addPlugin = React.useCallback(async (plugin: Blob): Promise<string> => {
        const data = new FormData();
        data.append('plugin', plugin, 'plugin.zip');

        const response = await pluginActions.addPlugin(data);
        
        if (!response.success)
            return `Error: ${ response.reason }.`;

        await updateConfig({
            plugins: [ ...config.plugins, response.value ]
        }, false);

        setPluginsToInstall(state => new Set([ ...state, response.value.name ]));

        return 'Successfully added the plugin.';
    }, [ config, updateConfig ]);

    const removePlugin = React.useCallback(async (name: string): Promise<string> => {
        const response = await pluginActions.removePlugin(name);

        if (!response.success)
            return `Error: ${ response.reason }.`;

        updateConfig({
            plugins: config.plugins.filter(plugin => plugin.name !== name)
        }, false);
        
        return `${ name } has been deleted.`;
    }, [ config, updateConfig ]);

    const togglePlugin = React.useCallback(async (name: string): Promise<string> => {
        const response = await pluginActions.togglePlugin(name);

        if (!response.success)
            return `Error: ${ response.reason }.`;

        const newPlugins = [ ...config.plugins ];
        const index = newPlugins.findIndex(plugin => plugin.name === name);
        newPlugins[ index ].enabled = !newPlugins[ index ].enabled;

        updateConfig({ plugins: newPlugins }, false);

        return `${ name } has been toggled ${ newPlugins[ index ].enabled ? 'on' : 'off' }.`;
    }, [ config, updateConfig ]);
    
    if (!plugins) return (<></>);

    return (
        <PluginsCTX.Provider value={ { addPlugin, removePlugin, togglePlugin, plugins } }>
            { children }
        </PluginsCTX.Provider>
    );
};

export { usePlugins, PluginsProvider };