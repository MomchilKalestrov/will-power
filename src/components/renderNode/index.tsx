'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import Overlay from './overlay';

type Props = {
    node: PageNode;
    editor?: true;
    root?: true;
    depth?: number;
};

const componentCache = new Map<string, React.ComponentType<any>>();

const getNodeType = (type: string): React.ComponentType<any> | null => {
    if (!type.match(/^[a-zA-Z]+$/)) return null; // check if it's a valid path

    if (componentCache.has(type))
        return componentCache.get(type)!;

    const Component = dynamic(() =>
        import(`@/components/blocks/${ type }`)
            .then((module) => module.default)
            .catch(() => (() => null)), // fallback to a null component
        { ssr: true }
    );
    componentCache.set(type, Component);
    return Component;
};

const RenderNode: React.FC<Props> = ({
    node: {
        id,
        children,
        type,
        attributes = {},
        style = {},
        props = {}
    },
    editor,
    root,
    depth = 0
}) => {
    const Component = React.useMemo(() => getNodeType(type), [ type ]);

    if (!Component) {
        console.warn("Unknown node type: " + type);
        return null;
    };

    return (
        <Component { ...{ ...attributes, ...props, style, id } }>
            {
                Array.isArray(children)
                ?   children.map((child) => <RenderNode depth={ depth + 1 } key={ id + '-' + child.id } node={ child } { ...{ editor } } />)
                :   (children || '')
            }
            { (editor && !root) && <Overlay { ...{ id, zIndex: depth + 1 } } /> }
        </Component>
    );
};

export default RenderNode;