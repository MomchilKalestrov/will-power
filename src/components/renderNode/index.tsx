'use client';
import React from 'react';
import Overlay from './overlay';
import { useComponentDb } from '@/components/componentDb';

type Props = {
    node: PageNode;
    editor?: true;
    root?: true;
    depth?: number;
};

const RenderNode: React.FC<Props> = ({
    node: {
        id,
        children = [],
        type,
        attributes = {},
        style = {},
        props = {}
    },
    editor,
    root,
    depth = 0
}) => {
    const { getComponent } = useComponentDb();
    const [ Component, setComponent ] = React.useState<React.ComponentType<any> | null | undefined>();
    
    React.useEffect(() => {
        getComponent(type)
            .then((value) => setComponent(() => (value ? value.Component : null)))
            .catch(() => setComponent(null));
    }, [ type ]);

    if (Component === null) {
        console.warn("Unknown node type: " + type);
        return null;
    };

    if (Component === undefined) return null;

    let newStyle: React.CSSProperties = {
        ...style,
        ...(editor && (style.position === 'static' || style.position === undefined) && {
            position: 'relative',
            top: 'unset',
            bottom: 'unset',
            left: 'unset',
            right: 'unset'
        })
    };
    
    return (
        <Component { ...{ ...attributes, ...props, style: newStyle, id } }>
            { children.map((child) => (
                <RenderNode
                    depth={ depth + 1 }
                    key={ id + '-' + child.id }
                    node={ child }
                    { ...{ editor } }
                />
            )) }
            { (editor && !root) && <Overlay { ...{ id, zIndex: depth + 1 } } /> }
        </Component>
    );
};

export default RenderNode;