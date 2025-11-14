'use client';
import React from 'react';
import MonacoEditor from '@monaco-editor/react';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';

import CssKeywordInput from '@/components/inputs/cssKeywordInput';
import AdvancedTextarea from '@/components/inputs/advancedTextarea';
import { ChevronDown } from 'lucide-react';

const propertyToDefault = (structure: objectProperty[]): any => {
    structure.reduce<any>((acc, property) => {
        acc[ property.key ] =
            property.type === 'object'
            ?   propertyToDefault((property as objectProperty & { type: 'object' }).structure)
            :   property.default;
        return acc;
    }, {});
};

type Props = {
    metadata: NodeMetadata;
    node: ComponentNode;
    nodeId: string;
    handleChange: (key: string, value: string, property: 'props') => void;
    onIdChange: (id: string) => void;
};

const ObjectProperty: React.FC<{
    enumerators: NodeMetadata[ 'enumerators' ];
    property: objectProperty;
    value: { [ key: string ]: any | undefined };
    handleChange: (key: string, value: any) => void;
    showName?: boolean;
}> = ({
    property,
    value,
    enumerators,
    handleChange
}) => {
    const name = property.key.replace(/([A-Z])/g, ' $1');
    const currentValue =
        value?.[ property.key ] ??
        property.type === 'object'
        ?   propertyToDefault((property as objectProperty & { type: 'object' }).structure)
        :   property.default;

    switch (property.type) {
        case 'enum':
                const options = enumerators[ property.key ]?.values;
                if (!options || options.length === 0) return null;

                return (
                    <div className='flex items-center flex-wrap justify-between gap-2 mb-2'>
                        <Label htmlFor={ `input-${ property.key }` } className='capitalize'>{ name }</Label>
                        <div className='grow'>
                            <CssKeywordInput
                                value={ currentValue }
                                options={ options }
                                id={ 'input-' + property.key }
                                onChange={ (newValue) =>
                                    handleChange(property.key, {
                                        ...value,
                                        [ property.key ]: newValue
                                    })
                                }
                            />
                        </div>
                    </div>
                );
        case 'number':
            return (
                <div className='flex items-center flex-wrap justify-between gap-2 mb-2'>
                    <Label htmlFor={ `input-${ property.key }` } className='capitalize'>{ name }</Label>
                    <Input
                        id={ `input-${ property.key }` }
                        value={ currentValue }
                        type='number'
                        onChange={ ({ target: { value: newValue } }) =>
                            handleChange(property.key, {
                                ...value,
                                [ property.key ]: newValue
                            })
                        }
                    />
                </div>
            );
        case 'string':
            return (
                <div className='grid gap-2 mb-2'>
                    <Label htmlFor={ `input-${ property.key }` } className='capitalize'>{ name }</Label>
                    <Textarea
                        id={ `input-${ property.key }` }
                        value={ currentValue }
                        onChange={ ({ target: { value: newValue } }) =>
                            handleChange(property.key, {
                                ...value,
                                [ property.key ]: newValue
                            })
                        }
                    />
                </div>
            );
        case 'object':
            return (
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button
                            variant='ghost'
                            className='capitalize w-full mb-2 justify-between'
                        >
                            { name }
                            <ChevronDown className='text-muted-foreground' />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className='ml-2 pl-2 border-l'>
                        { property.structure.map((property) => (
                            <ObjectProperty
                                property={ property }
                                enumerators={ enumerators }
                                value={ currentValue }
                                handleChange={ (key, newValue) =>
                                    handleChange(property.key, {
                                        ...value,
                                        [ key ]: newValue
                                    })
                                }
                            />
                        )) }
                    </CollapsibleContent>
                </Collapsible>
            );
    };
};

const PropsFields: React.FC<Props> = ({
    metadata,
    node,
    nodeId,
    handleChange,
    onIdChange
}) => {
    const [ editableId, setEditableId ] = React.useState<string>(nodeId);

    React.useEffect(() => {
        setEditableId(nodeId);
    }, [ nodeId ]);

    return (
        <>
            <h3 className='text-lg font-bold mb-2'>{ node.type } Properties</h3>
            <div className='flex items-center flex-wrap justify-between gap-2'>
                <Label htmlFor='input-id' className='capitalize w-8'>Id</Label>
                <div className='grow'>
                    <Input
                        id='input-id'
                        type='text'
                        value={ editableId }
                        onChange={ (e) => setEditableId(e.target.value) }
                        onBlur={ () => onIdChange(editableId) }
                        onKeyDown={ e => {
                            if (e.key === 'Enter')
                                onIdChange(editableId);
                        } }
                    />
                </div>
            </div>
            { Object.entries(metadata.props).map(([ key, prop ]) => {
                const currentValue = node.props?.[ key ] ?? prop.default;
                const name = key.replace(/([A-Z])/g, ' $1');

                switch (prop.type) {
                    case 'string':
                        return (
                            <div key={ key } className='grid gap-2'>
                                <Label htmlFor={ `input-${ key }` } className='capitalize'>{ name }</Label>
                                <AdvancedTextarea
                                    id={ `input-${ key }` }
                                    value={ currentValue }
                                    onChange={ (value) => handleChange(key, value, 'props') }
                                />
                            </div>
                        );
                    case 'enum':
                        const options = metadata.enumerators[ key ]?.values;
                        if (!options || options.length === 0) return null;

                        return (
                            <div key={ key } className='flex items-center flex-wrap justify-between gap-2'>
                                <Label htmlFor={ `input-${ key }` } className='capitalize'>{ name }</Label>
                                <div className='grow'>
                                    <CssKeywordInput
                                        value={ currentValue }
                                        options={ options }
                                        id={ 'input-' + key }
                                        onChange={ (newValue) =>
                                            handleChange(key, newValue, 'props')
                                        }
                                    />
                                </div>
                            </div>
                        );
                    case 'number':
                    case 'line':
                        return (
                            <div key={ key } className='grid gap-2'>
                                <Label htmlFor={ `input-${ key }` } className='capitalize'>{ name }</Label>
                                <Input
                                    id={ `input-${ key }` }
                                    value={ currentValue }
                                    type={ prop.type === 'line' ? 'text' : prop.type }
                                    onChange={ ({ target: { value } }) =>
                                        handleChange(key, value, 'props')
                                    }
                                />
                            </div>
                        );
                    case 'code':
                        return (
                            <div key={ key } className='grid gap-2'>
                                <Label className='capitalize'>{ name }</Label>
                                <Card className='py-0 overflow-hidden'>
                                    <MonacoEditor
                                        defaultValue={ currentValue }
                                        language='html'
                                        theme={
                                            document.body.classList.contains('dark')
                                            ?   'vs-dark'
                                            :   'light'
                                        }
                                        onChange={ text => {
                                            handleChange(key, text || '', 'props');
                                        } }
                                        className='h-64'
                                    />
                                </Card>
                            </div>
                        );
                    case 'custom':
                        return (
                            <div key={ key } className='grid gap-2'>
                                <ObjectProperty
                                    property={ prop.structure }
                                    enumerators={ metadata.enumerators }
                                    value={ currentValue }
                                    handleChange={ console.log }
                                />
                            </div>
                        );
                };
            }) }
        </>
    );
};

export default PropsFields;