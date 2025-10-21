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
    getComponent: async (type: string) => null,
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

    const getComponent = async (type: string): Promise<componentData | null> => {
        if (!type.match(/^[a-zA-Z]+$/)) return null;

        if (components.has(type))
            return components.get(type)!;
        
        const module = require(`@/components/blocks/${ type }`);
        const { metadata, Icon, default: Component } = awaitable(module) ? await module : module;
        const data: componentData = { metadata, Component, Icon };
        
        const newMap = new Map(components);
        newMap.set(type, data);
        setComponents(newMap);
        
        return data;
    };

    const { config } = useConfig();

    const [ componentNames, setComponentNames ] = React.useState(baseComponentNames);

    React.useEffect(() => {
        console.log(config)
        if (!config) return;
        setComponentNames([ ...baseComponentNames, ...config.plugins.map(({ name }) => name) ])
    }, [ config ]);

    return (
        <ComponentDbCTX.Provider value={ { getComponent, components: componentNames } }>
            { children }
        </ComponentDbCTX.Provider>
    );
};

export { useComponentDb, ComponentDbProvider, type componentData };