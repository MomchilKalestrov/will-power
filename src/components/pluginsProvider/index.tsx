'use client';
import React from 'react';
import ReactDom from 'react-dom';
import ReactJsxRuntime from 'react/jsx-runtime';

import { useConfig } from '@/components/configProvider';

import type { plugin } from '@/lib/config';
import * as actions from '@/lib/plugins';
import * as componentActions from '@/lib/db/actions/component';
import * as configActions from '@/lib/config';
import { pluginModuleSchema } from '@/lib/zodSchemas';

type pluginInstance = plugin & {
    components: ({
        Icon: React.ComponentType<any>;
        Component: React.ComponentType<any>;
        metadata: NodeMetadata & {
            name: string;
            type: 'page' | 'component';
        };
    })[];
};

class WP {
    components: typeof componentActions;
    plugins: typeof actions;
    config: typeof configActions;
    storageURL: URL;

    constructor() {
        this.components = componentActions;
        this.plugins = actions;
        this.config = configActions;
        this.storageURL = new URL(process.env.NEXT_PUBLIC_BLOB_URL!);
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
}>({
    plugins: new Map(),
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
    const [ plugins, setPlugins ] = React.useState<Map<string, pluginInstance>>();

    React.useEffect(() => {
        window.WP = Object.freeze(new WP());
        window.React = React;
        window.ReactDOM = ReactDom;
        window.ReactJsxRuntime = ReactJsxRuntime;
    }, []);

    React.useEffect(() => {
        (async () => {
            const newState = new Map<string, pluginInstance>();
            for (const plugin of config.plugins) {    
                try {
                    const module = plugins?.has(plugin.name)
                    ?   plugins.get(plugin.name)!
                    :   await import(
                            /* webpackIgnore: true */
                            `plugins/${ plugin.name }/index.js`
                        );   
                    var parsedModule = pluginModuleSchema.parse(module) as any;
                } catch (error) {
                    console.log('Malformed plugin: ' + plugin.name, error);
                };
                newState.set(plugin.name, { ...plugin, ...parsedModule });
            }
            setPlugins(newState);
        })();
    }, [ config.plugins ]);

    const addPlugin = React.useCallback(async (plugin: Blob): Promise<string> => {
        const data = new FormData();
        data.append('plugin', plugin, 'plugin.zip');

        const response = await actions.addPlugin(data);
        
        if (typeof response === 'string')
            return `Error: ${ response }.`;

        await updateConfig({
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