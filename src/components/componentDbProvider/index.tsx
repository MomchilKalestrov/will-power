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

    const getComponent = React.useCallback(async (type: string): Promise<componentData | null> => {
        if (!type.match(/^[a-zA-Z]+$/)) return null;

        if (components.has(type))
            return components.get(type)!;
        
        try {
            var module = pluginComponentNames.has(type)
            ?   await import(/* webpackIgnore: true */`plugins/${ type }/index.js`)
            :   require(`@/components/blocks/${ type }`)
        } catch (error) {
            console.log('failed getting the component', error)
            return null;
        };

        console.log(type, module);

        const { metadata, Icon, default: Component } = awaitable(module) ? await module : module;
        const data: componentData = { metadata, Component, Icon };

        const newMap = new Map(components);
        newMap.set(type, data);
        setComponents(newMap);

        return data;
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