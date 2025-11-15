'use client';
import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';

import CssKeywordInput from '@/components/inputs/cssKeywordInput';
import AdvancedTextarea from '@/components/inputs/advancedTextarea';
import { getObjectPropertyDefault } from '@/lib/propsFiller';

type Props = {
    metadata: NodeMetadata;
    node: ComponentNode;
    nodeId: string;
    handleChange: (key: string, value: any, property: 'props') => void;
    onIdChange: (id: string) => void;
};

const ObjectProperty: React.FC<{
    enumerators: NodeMetadata[ 'enumerators' ];
    property: objectProperty;
    value: any;
    handleChange: (key: string, value: any) => void;
    showName?: boolean;
}> = ({
    property,
    value,
    enumerators,
    handleChange,
    showName = true
}) => {
    const name = property.key.replace(/([A-Z])/g, ' $1');
    
    const defaultValue = React.useMemo(() =>
        getObjectPropertyDefault(property),
        [ property ]
    );

    let currentValue = value ?? defaultValue;
    console.log(currentValue, value, defaultValue)
    if (property.type !== 'object' && typeof currentValue === 'object')
        currentValue = currentValue[ property.key ] ?? defaultValue[ property.key ];

    switch (property.type) {
        case 'enum':
                const options = enumerators[ property.key ]?.values;
                if (!options || options.length === 0) return (<></>);

                return (
                    <div className='flex items-center flex-wrap justify-between gap-2 mb-2'>
                        {
                            showName &&
                            <Label htmlFor={ `input-${ property.key }` } className='capitalize'>{ name }</Label>
                        }
                        <div className='grow'>
                            <CssKeywordInput
                                value={ currentValue }
                                options={ options }
                                id={ 'input-' + property.key }
                                onChange={ (newValue) =>
                                    handleChange(property.key, newValue)
                                }
                            />
                        </div>
                    </div>
                );
        case 'number':
            return (
                <div className='flex items-center flex-wrap justify-between gap-2 mb-2'>
                    {
                        showName &&
                        <Label htmlFor={ `input-${ property.key }` } className='capitalize'>{ name }</Label>
                    }
                    <Input
                        id={ `input-${ property.key }` }
                        value={ currentValue }
                        type='number'
                        onChange={ ({ target: { value: newValue } }) =>
                            handleChange(property.key, Number(newValue) ?? 0)
                        }
                    />
                </div>
            );
        case 'string':
            return (
                <div className='grid gap-2 mb-2'>
                    {
                        showName &&
                        <Label htmlFor={ `input-${ property.key }` } className='capitalize'>{ name }</Label>
                    }
                    <Textarea
                        className='min-h-[38px]'
                        id={ `input-${ property.key }` }
                        value={ currentValue }
                        onChange={ ({ target: { value: newValue } }) =>
                            handleChange(property.key, newValue)
                        }
                        rows={ 1 }
                    />
                </div>
            );
        case 'object':
            const contents = property.structure.map((property, index) => (
                <ObjectProperty
                    key={ index }
                    property={ property }
                    enumerators={ enumerators }
                    value={ currentValue }
                    handleChange={ (key, newValue) =>
                        handleChange(property.key, {
                            ...currentValue,
                            [ key ]: newValue
                        })
                    }
                />
            ));

            if (!showName) return contents;

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
                    <CollapsibleContent className='pl-2 border-l'>
                        { contents }
                    </CollapsibleContent>
                </Collapsible>
            );
            case 'array':
                return (
                    <div className='space-y-2 mb-2'>
                        {
                            showName &&
                            <Label className='capitalize'>{ name }</Label>
                        }
                        <div className='pl-2 border-l'>
                            { (currentValue as any[]).map((v, index) => (
                                <React.Fragment key={ index }>
                                    <ObjectProperty
                                        property={ property.structure }
                                        enumerators={ enumerators }
                                        value={ v }
                                        showName={ false }
                                        handleChange={ (_, value) => {
                                            const newArray = [ ...currentValue ];
                                            newArray[ index ] = value;
                                            handleChange(property.key, newArray);
                                        } }
                                    />
                                    {
                                        (property.structure.type === 'object' ||
                                        property.structure.type === 'array') &&
                                        <Separator className='my-2' />
                                    }
                                </React.Fragment>
                            )) }
                            <div className='flex gap-2'>
                                <Button
                                    className='grow'
                                    onClick={ () =>
                                        handleChange(property.key, [
                                            ...currentValue || [],
                                            defaultValue[ property.key ][ 0 ]
                                        ])
                                    }
                                ><Plus /></Button>
                                <Button
                                    variant='destructive'
                                    className='grow'
                                    onClick={ () =>
                                        handleChange(property.key, [
                                            ...(currentValue as any[] ?? []).slice(0, -1)
                                        ])
                                    }
                                ><Trash2 /></Button>
                            </div>
                        </div>
                    </div>
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
                                    value={ {
                                        [ prop.structure.key ]: currentValue
                                    } }
                                    handleChange={ (_, value) =>{
                                        handleChange(key, value, 'props')
                                    }}
                                />
                            </div>
                        );
                };
            }) }
        </>
    );
};

export default PropsFields;