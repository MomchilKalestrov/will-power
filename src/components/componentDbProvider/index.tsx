'use client';
import React from 'react';
import { usePlugins } from '@/components/pluginsProvider';
import { awaitable, validName } from '@/lib/utils';

type componentData = {
    Icon: React.ComponentType<any>;
    Component: React.ComponentType<any>;
    metadata: NodeMetadata & {
        name: string;
        type: "page" | "component";
    };
};

const ComponentDbCTX = React.createContext<{
    getComponent: (type: string) => Promise<componentData | null>;
    components: string[]
}>({
    getComponent: async () => null,
    components: []
});

const useComponentDb = () => React.useContext(ComponentDbCTX);

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

const ComponentDbProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
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
        <ComponentDbCTX.Provider value={ {
            getComponent,
            components: [ ...baseComponentNames, ...pluginComponents.keys() ]
        } }>
            { children }
        </ComponentDbCTX.Provider>
    );
};

export { useComponentDb, ComponentDbProvider, type componentData };