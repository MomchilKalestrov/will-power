'use client';
import React from 'react';

import { Separator } from '@/components/ui/separator';

import PropsFields from './propsFields';
import StyleFields from './styleFields';

type PropertiesPanelProps = {
    node: ComponentNode;
    metadata: NodeMetadata;
    onNodeUpdate: (id: string, data: Partial<Omit<ComponentNode, 'children'>>) => void;
};

type groupedProps<T> = Record<string, (Omit<T & { name: string, key: string }, 'in'>)[]>;

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, metadata, onNodeUpdate }) => {
    const groupedStyles = React.useMemo<groupedProps<style>> (() => {
        let buckets: groupedProps<style> = {};

        Object
            .entries(metadata.styles)
            .forEach(([ key, value ]) => {
                if (!(value.in in buckets))
                    buckets[ value.in ] = [];
                const name = key.split('-').pop()!.replace(/([A-Z])/g, ' $1');
                buckets[ value.in ].push({ key, name, ...value });
            });

        return buckets;
    }, [ node.type ]);

    const handleChange = React.useCallback((key: string, value: any, property: 'style' | 'props' | 'attributes') =>
        onNodeUpdate(node.id, {
            [ property ]: {
                ...(node[ property ] || {}),
                [ key ]: value,
            },
        }),
        [ onNodeUpdate, node ]
    );

    return (
        <div className='space-y-4'>
            <PropsFields
                metadata={ metadata }
                node={ node }
                nodeId={ node.id }
                handleChange={ handleChange }
                onIdChange={ id => onNodeUpdate(node.id, { id }) }
            />
            <Separator />
            {
                Object.keys(groupedStyles).length > 0 &&
                <StyleFields
                    metadata={ metadata }
                    node={ node }
                    groupedStyles={ groupedStyles }
                    handleChange={ handleChange }
                />
            }
        </div>
    );
};

export default PropertiesPanel;
