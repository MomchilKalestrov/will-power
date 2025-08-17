'use client';
import React from 'react';

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

const ComponentDbProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ components, setComponents ] = React.useState<Map<string, componentData>>(new Map());

    const getComponent = async (type: string): Promise<componentData | null> => {
        if (!type.match(/^[a-zA-Z]+$/)) return null;

        if (components.has(type))
            return components.get(type)!;
        
        const { metadata, Icon, default: Component } = require(`@/components/blocks/${ type }`);
        const data: componentData = { metadata, Component, Icon };
        
        const newMap = new Map(components);
        newMap.set(type, data);
        setComponents(newMap);
        
        return data;
    };

    const componentNames = React.useMemo(() => [
        'Container',
        'Header',
        'Paragraph'
    ], []);

    return (
        <ComponentDbCTX.Provider value={ { getComponent, components: componentNames } }>
            { children }
        </ComponentDbCTX.Provider>
    );
};

export { useComponentDb, ComponentDbProvider, type componentData };