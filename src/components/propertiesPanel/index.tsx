'use client';
import React from 'react';
import CssUnitInput from './cssUnitInput';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import CssKeywordInput from './cssKeywordInput';
import { Accordion, AccordionContent } from '../ui/accordion';
import { AccordionItem, AccordionTrigger } from '@radix-ui/react-accordion';

type PropertiesPanelProps = {
    node: PageNode;
    metadata: NodeMetadata;
    onNodeUpdate: (id: string, data: Partial<Omit<PageNode, 'children'>>) => void;
};

type groupedProps<T> = Record<string, (Omit<T & { name: string, key: string }, 'in'>)[]>;

const isVisible = (
    node: PageNode,
    metadata: NodeMetadata,
    condition: condition | undefined,
    key: 'props' | 'styles' | 'attributes'
): boolean => {
    if (!condition) return true;
    const nodeAccessor: string = ({ props: 'props', styles: 'style', attributes: 'attributes' })[ key ];

    const value = node[ nodeAccessor ][ condition.key ] ?? metadata[ key ][ condition.key ].default;
    let result = value == condition.value;

    if ('or' in condition)
        result = result || isVisible(node, metadata, condition.or, key);
    else if ('and' in condition)
        result = result && isVisible(node, metadata, condition.and, key);

    return result;
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, metadata, onNodeUpdate }) => {
    const [ editableId, setEditableId ] = React.useState<string>(node.id);

    React.useEffect(() => {
        setEditableId(node.id);
    }, [node.id]);

    const handleIdUpdate = () => {
        if (editableId && editableId !== node.id)
            onNodeUpdate(node.id, { id: editableId });
    };

    const groupedStyles = React.useMemo<groupedProps<style>> (() => {
        let buckets: groupedProps<style> = {};

        Object
            .entries(metadata.styles)
            .forEach(([ key, value ]) => {
                if (!(value.in in buckets))
                    buckets[ value.in ] = [];
                const name = key.replace(/([A-Z])/g, ' $1');
                buckets[ value.in ].push({ key, name, ...value });
            });

        return buckets;
    }, [ node.type ]);

    const handleStyleChange = (key: string, value: string) => {
        onNodeUpdate(node.id, {
            style: {
                ...(node.style || {}),
                [ key ]: value,
            },
        });
    };

    const handlePropChange = (key: string, value: any) => {
        onNodeUpdate(node.id, {
            props: {
                ...(node.props || {}),
                [ key ]: value,
            },
        });
    };

    return (
        <div className='space-y-4'>
            <div>
                <h3 className='font-semibold text-lg'>{ node.type } Properties</h3>
                <div className='grid gap-2'>
                    <Label htmlFor={ `input-id` } className='capitalize'>Id</Label>
                    <Input
                        id='input-id'
                        type='text'
                        value={ editableId }
                        onChange={ (e) => setEditableId(e.target.value) }
                        onBlur={ handleIdUpdate }
                        onKeyDown={(e) => {
                            if (e.key === 'Enter')
                                handleIdUpdate();
                        }}
                    />
                </div>
            </div>
            <Separator />
            { Object.keys(groupedStyles).length > 0 && (
                 <div>
                    <h4 className='font-medium text-base mb-2'>Styles</h4>
                    <div className='space-y-4'>
                        <Accordion type='single' collapsible>
                            { Object.entries(groupedStyles).map((([ key, styles ]) => (
                                <AccordionItem value={ key } key={ key } className='w-full'>
                                    <AccordionTrigger className='mb-2 pb-2 border-b-1 w-full text-left'>{ key }</AccordionTrigger>
                                    <AccordionContent className='flex flex-col gap-2'>
                                        { styles.map((style) => {
                                            const currentValue = node.style?.[ style.key ] ?? style.default;

                                            if (!isVisible(node, metadata, style.condition, 'styles')) return;

                                            switch(style.type) {
                                                case 'string':
                                                    return (
                                                        <div key={ style.key } className='grid gap-2'>
                                                            <Label htmlFor={ `input-${ style.key }` } className='capitalize'>{ style.name }</Label>
                                                            <Input
                                                                id={ `input-${ style.key }` }
                                                                type='text'
                                                                value={ currentValue }
                                                                onChange={ (e) => handleStyleChange(style.key, e.target.value) }
                                                            />
                                                        </div>
                                                    );
                                                case 'css-units':
                                                    return (
                                                        <div key={ style.key } className='grid gap-2'>
                                                            <Label className='capitalize'>{ style.name }</Label>
                                                            <CssUnitInput
                                                                value={ currentValue }
                                                                units={ (style as typeof style & { units: string[] }).units }
                                                                count={ style.count || 1 }
                                                                onChange={ (newValue) => handleStyleChange(style.key, newValue) }
                                                            />
                                                        </div>
                                                    );
                                                case 'keyword':
                                                    const options = metadata.enumerators[ style.key ]?.values;
                                                    if (!options || options.length === 0) return;
                                                    return (
                                                        <div key={ style.key } className='flex items-center flex-wrap justify-between gap-2'>
                                                            <Label htmlFor={ style.key } className='capitalize w-32'>{ style.name }</Label>
                                                            <div className='flex-grow'>
                                                                <CssKeywordInput
                                                                    value={ currentValue }
                                                                    options={ options }
                                                                    id={ style.key }
                                                                    placeholder={ style.name }
                                                                    onChange={ (newValue) => handleStyleChange(style.key, newValue) }
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                            };
                                        })}         
                                    </AccordionContent>
                                </AccordionItem>
                            ))) }    
                        </Accordion>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertiesPanel;
