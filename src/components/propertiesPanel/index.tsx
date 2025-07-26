'use client';
import React from 'react';
import CssUnitInput from './cssUnitInput';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import CssKeywordInput from './cssKeywordInput';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ColorPicker from './colorPicker';
import BackgroundPicker from './backgroundPicker';
import { Button } from '../ui/button';
import { Ban } from 'lucide-react';
import GradientPicker from './gradientPicker';
import ShadowPicker from './ShadowPicker';

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
    if (condition.comparison === 'different')
        result = !result;

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

    const handleChange = (key: string, value: string, property: 'style' | 'props' | 'attributes') => {
        onNodeUpdate(node.id, {
            [ property ]: {
                ...(node.style || {}),
                [ key ]: value,
            },
        });
    };

    return (
        <div className='space-y-4'>
            <h3 className='text-lg font-bold mb-2'>{ node.type } Properties</h3>
            <div className='flex items-center flex-wrap justify-between gap-2'>
                <Label htmlFor='input-id' className='capitalize w-8'>Id</Label>
                <div className='flex-grow'>
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
                    <h3 className='text-lg font-bold mb-2'>Styles</h3>
                    <div className='space-y-4'>
                        <Accordion type='single' collapsible>
                            { Object.entries(groupedStyles).map((([ key, styles ]) => (
                                <AccordionItem value={ key } key={ key } className='w-full'>
                                    <AccordionTrigger>{ key }</AccordionTrigger>
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
                                                                onChange={ (e) => handleChange(style.key, e.target.value, 'style') }
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
                                                                count={ (style as typeof style & { count?: number }).count || 1 }
                                                                onChange={ (newValue) => handleChange(style.key, newValue, 'style') }
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
                                                                    onChange={ (newValue) => handleChange(style.key, newValue, 'style') }
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                case 'background':
                                                    let selected: 'image' | 'gradient' | 'color' | 'none';                                                    
                                                    if (currentValue.includes('url'))
                                                        selected = 'image';
                                                    else if (currentValue.includes('gradient'))
                                                        selected = 'gradient';
                                                    else if (currentValue === 'unset')
                                                        selected = 'none';
                                                    else
                                                        selected = 'color';

                                                    const onChange = (newValue: string) => handleChange(style.key, newValue, 'style');
                                                    const params = { onChange, value: currentValue };

                                                    return (
                                                        <div key={ style.key } className='flex items-center flex-wrap justify-between gap-2'>
                                                            <Label htmlFor={ style.key } className='capitalize w-32'>{ style.name }</Label>
                                                            <div className='flex-grow flex justify-end gap-2'>
                                                                <ColorPicker selected={ selected === 'color' } { ...params } />
                                                                <BackgroundPicker selected={ selected === 'image' } { ...params } />
                                                                <GradientPicker selected={ selected === 'gradient' } { ...params } />
                                                                <Button
                                                                    size='icon'
                                                                    className='size-8 p-2'
                                                                    variant={ selected === 'none' ? 'outline' : 'ghost' }
                                                                    onClick={ () => handleChange(style.key, 'unset', 'style') }
                                                                ><Ban /></Button>
                                                            </div>
                                                        </div>
                                                    );
                                                case 'shadow':
                                                    return (
                                                        <div key={ style.key } className='flex items-center flex-wrap justify-between gap-2'>
                                                            <Label htmlFor={ style.key } className='capitalize w-32'>{ style.name }</Label>
                                                            <div className='flex-grow flex justify-end gap-2'>
                                                                <ShadowPicker
                                                                    value={ currentValue }
                                                                    selected={ currentValue !== 'unset' }
                                                                    onChange={ (newValue) => handleChange(style.key, newValue, 'style') }
                                                                />
                                                                <Button
                                                                    size='icon'
                                                                    className='size-8 p-2'
                                                                    variant={ currentValue === 'unset' ? 'outline' : 'ghost' }
                                                                    onClick={ () => handleChange(style.key, 'unset', 'style') }
                                                                ><Ban /></Button>
                                                            </div>
                                                        </div>
                                                    )
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
