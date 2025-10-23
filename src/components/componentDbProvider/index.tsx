'use client';
import React from 'react';
import { awaitable } from '@/lib/utils';
import { useConfig } from '@/components/configProvider';

type componentData = {
    metadata: NodeMetadata;
    Component: React.ComponentType<any>;
    Icon: React.ComponentType<any>;
};

const ComponentDbCTX = React.createContext<{
    getComponent: (type: string) => Promise<componentData | null>;
    components: string[]
}>({
    getComponent: async _ => null,
    components: []
});

const useComponentDb = () => React.useContext(ComponentDbCTX);

const baseComponentNames = [
    'Container',
    'Header',
    'Paragraph',
    'Component'
];

const ComponentDbProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ components, setComponents ] = React.useState<Map<string, componentData>>(new Map());
    const { config } = useConfig();
    const pluginComponentNames = React.useMemo<Set<string>>(() => 
        new Set(config.plugins.map(({ name }) => name))
    , [ config ]);

    const getBaseComponent = React.useCallback(async (type: string): Promise<componentData | null> => {
        try { var module = require(`@/components/blocks/${ type }`); }
        catch { return null };

        const { metadata, Icon, default: Component } = awaitable(module) ? await module : module;
        const data: componentData = { metadata, Component, Icon };
        
        return data;
    }, [ components ]);

    const getPluginComponent = React.useCallback(async (type: string): Promise<componentData | null> => {
        const response = await fetch(`${ process.env.NEXT_PUBLIC_BLOB_URL }/plugins/${ type }/index.js`);
        const moduleCode = await response.text();
        
        const blob = new Blob([ moduleCode ], { type: 'application/javascript' });
        const moduleUrl = URL.createObjectURL(blob);
        const module = await import(/* webpackIgnore: true */ moduleUrl);
        URL.revokeObjectURL(moduleUrl);
        
        const { metadata, Icon, default: Component } = module;

        return { metadata, Component, Icon };
    }, [ components ]);

    const getComponent = React.useCallback(async (type: string): Promise<componentData | null> => {
        if (!type.match(/^[a-zA-Z]+$/)) return null;

        if (components.has(type))
            return components.get(type)!;
        
        const component = pluginComponentNames.has(type)
        ?   await getPluginComponent(type)
        :   await getBaseComponent(type);
        
        if (!component) return null;
        
        const newMap = new Map(components);
        newMap.set(type, component);
        setComponents(newMap);

        return component;
    }, [ components, pluginComponentNames ]);

    return (
        <ComponentDbCTX.Provider value={ {
            getComponent,
            components: [ ...baseComponentNames, ...pluginComponentNames || [] ]
        } }>
            { children }
        </ComponentDbCTX.Provider>
    );
};

export { useComponentDb, ComponentDbProvider, type componentData };