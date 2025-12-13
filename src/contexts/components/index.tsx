'use client';
import React from 'react';
import { usePlugins } from '@/contexts/plugins';
import { awaitable, validName } from '@/lib/utils';

declare global {
    type componentData = {
        Icon: React.ComponentType<any>;
        Component: React.ComponentType<any>;
        metadata: NodeMetadata & {
            name: string;
            type: "page" | "component";
        };
    };
};

const ComponentsCTX = React.createContext<{
    getComponent: (type: string) => Promise<componentData | null>;
    components: string[]
} | undefined>(undefined);

const useComponents = () => {
    const value = React.useContext(ComponentsCTX);
    if (!value) throw new Error('useComponents must be used within a ComponentsProvider');
    return value;
};

const baseComponentNames = [
    'Container',
    'Header',
    'Paragraph',
    'Component',
    'CustomHTML',
    'Button',
    'Accordion',
    'Link'
];

const ComponentsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ components, setComponents ] = React.useState<Map<string, componentData>>(new Map());
    const { plugins } = usePlugins();
    const pluginComponents = React.useMemo<Map<string, componentData>>(() =>
        new Map(
            [ ...plugins.values() ]
                .filter(({ enabled }) => enabled)
                .map(({ components }) => components)
                .flat()
                .filter(Boolean)
                .map((component: any) => [
                    component.metadata.name,
                    component
                ])
        )
    , [ plugins ]);

    const getComponent = React.useCallback(async (type: string): Promise<componentData | null> => {
        if (!validName(type)) return null;

        if (components.has(type))
            return components.get(type)!;
        
        try {
            var module =
                pluginComponents.get(type) ??
                require(`@/components/blocks/${ type }`);
        } catch (error) {
            console.error('failed getting the component', error)
            return null;
        };

        const data = awaitable(module) ? await module : module;

        const newMap = new Map(components);
        newMap.set(type, data);
        setComponents(newMap);

        return data;
    }, [ components, pluginComponents ]);

    return (
        <ComponentsCTX.Provider value={ {
            getComponent,
            components: [ ...baseComponentNames, ...pluginComponents.keys() ]
        } }>
            { children }
        </ComponentsCTX.Provider>
    );
};

export { useComponents, ComponentsProvider };