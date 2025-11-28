'use client';
import React from 'react';
import { componentData, useComponentDb } from '@/components/componentDbProvider';
import Overlay from './overlay';

type Props = {
    node: ComponentNode;
    editor?: true;
    root?: true;
    depth?: number;
    onTreeLoaded?: () => void;
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
    depth = 0,
    onTreeLoaded: onTreeLoadedCallback
}) => {
    const { getComponent } = useComponentDb();
    const [ loadedCount, setLoadedCount ] = React.useState<number>(0);
    const [ componentData, setComponentData ] = React.useState<componentData | null | undefined>();

    const onTreeLoaded = React.useCallback(() => {
        setLoadedCount(loadedCount + 1);
        if (loadedCount + 1 === children.length)
            onTreeLoadedCallback?.();
    }, [ loadedCount ]);

    React.useEffect(() => {
        getComponent(type)
            .then(value => setComponentData(() => value))
            .catch(() => setComponentData(null));
    }, [ type ]);

    React.useEffect(() => {
        if (children.length === 0)
            onTreeLoadedCallback?.();
    }, []);

    if (componentData === null) {
        console.warn("Unknown node type: " + type);
        return null;
    };

    if (componentData === undefined) return null;

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

    const { Component } = componentData!;
    
    return (
        <Component { ...{ ...attributes, ...props, style: newStyle, id } }>
            { children.map((child) => (
                <RenderNode
                    depth={ depth + 1 }
                    key={ id + '-' + child.id }
                    node={ child }
                    editor={ editor }
                    onTreeLoaded={ onTreeLoaded }
                />
            )) }
            {
                (editor && !root) &&
                <Overlay
                    id={ id }
                    zIndex={ depth + 1 }
                    acceptChildren={ componentData.metadata.acceptChildren }
                />
            }
        </Component>
    );
};

export default RenderNode;