'use client';
import React from 'react';
import Link from 'next/link';
import { CaseSensitive, Settings, Variable } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useConfig } from '@/contexts/config';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

import { cn, fontToCss, cssToFont } from '@/lib/utils';

import CssUnitInput from './cssUnitInput';
import CssKeywordInput from './cssKeywordInput';

type Props = {
    value: string | fontVariable;
    onChange: (newValue: string) => void;
    noVars?: boolean;
};

const FontInput: React.FC<Props> = ({
    value: initialFont,
    onChange: onChangeCallback,
    noVars
}) => {
    const { config } = useConfig();
    const [ variable, setVariable ] = React.useState<fontVariable | undefined>(undefined);
    const [ variables, setVariables ] = React.useState<fontVariable[]>([]); 
    const [ typefaces, setTypefaces ] = React.useState<string[]>([]);
    const [ font, setFont ] = React.useState<font>();

    React.useEffect(() => {
        const variables = config.variables.filter(variable => variable.type === 'font');
        setVariables(variables);

        setTypefaces(
            config
            .fonts
                .map(({ family }) => family)
                .concat([
                    'Arial',
                    'Verdana',
                    'Tahoma',
                    'Trebuchet MS',
                    'Times New Roman',
                    'Georgia',
                    'Garamond',
                    'Courier New',
                    'Brush Script MT'
                ])
        );

        if (typeof initialFont === 'object')
            return setFont(initialFont);

        if (!initialFont.startsWith('var(--'))
            return setFont(cssToFont(initialFont));        

        const variableId = initialFont.substring(6, initialFont.length - 1);
        const variable = variables.find(({ id }) => variableId === id);

        setVariable(variable);
        setFont(variable || {
            family: 'Times New Roman',
            style: 'normal',
            size: '1rem',
            weight: 'normal',
            fallback: 'sans-serif'
        });
    }, []);

    const onVariableChange = React.useCallback((value: string) => {
        const newVariable = variables.find(({ id }) => id === value);
        if (!newVariable) return;
        setFont(newVariable);
        setVariable(newVariable);
        onChangeCallback(`var(--${ newVariable.id })`);
    }, [ variables, onChangeCallback ]);

    const updateFont = React.useCallback((key: string, value: string) => {
        if (variable)
            setVariable(undefined);
        const newFont: font = { ...font!, [ key ]: value };
        setFont(newFont);
        onChangeCallback(fontToCss(newFont));
    }, [ font, variable, onChangeCallback ]);

    if (!font) return null;

    const showVars = (variables.length !== 0) && !noVars;
    const currentVarId = variable?.id;
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='outline' size='icon'>
                    <CaseSensitive />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='grid gap-2 grid-cols-[auto_1fr]'>
                {
                    showVars &&
                    <div className='col-span-full flex justify-end gap-2'>
                        <Button variant='outline' size='icon'>
                            <Link href='/admin/config'><Settings /></Link>
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant='outline' size='icon'>
                                    <Variable />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-auto flex flex-col" align='start'>
                                { variables.map((variable) => (
                                    <Button
                                        variant='ghost'
                                        key={ variable.id }
                                        style={ { font: fontToCss(variable) } }
                                        onClick={ () => onVariableChange(variable.id) }
                                        className={ cn(
                                            'w-full justify-start rounded-none',
                                            variable.id === currentVarId && 'bg-muted'
                                        ) }
                                    >{ variable.name }</Button>
                                )) }
                            </PopoverContent>
                        </Popover>
                    </div>
                }
                <Label htmlFor='input-font-family'>Family</Label>
                <Select onValueChange={ (value) => updateFont('family', value) } value={ font.family }>
                    <SelectTrigger id='input-font-family' className='w-full'>
                        { font.family }
                    </SelectTrigger>
                    <SelectContent>
                        { typefaces.map((typeface) => (
                            <SelectItem style={ { fontFamily: typeface } } key={ typeface } value={ typeface }>
                                { typeface }
                            </SelectItem>
                        )) }
                    </SelectContent>
                </Select>
                <Label htmlFor='input-font-family'>Style</Label>
                <CssKeywordInput
                    value={ font.style }
                    onChange={ (value) => updateFont('style', value) }
                    options={ [ 'normal', 'italic' ] }
                    id='input-font-family'
                />
                <Label>Size</Label>
                <CssUnitInput
                    value={ font.size }
                    onChange={ (value) => updateFont('size', value) }
                    count={ 1 }
                    units={ [ 'rem', 'em', 'px' ] }
                    allowCustom={ false }
                />
                <Label htmlFor='input-font-weight'>Weight</Label>
                <CssKeywordInput
                    value={ font.weight }
                    onChange={ (value) => updateFont('weight', value) }
                    options={ [ 'lighter', 'normal', 'bold', 'bolder' ] }
                    id='input-font-weight'
                />
                <Label htmlFor='input-font-weight'>Fallback</Label>
                <CssKeywordInput
                    value={ font.fallback }
                    onChange={ (value) => updateFont('fallback', value) }
                    options={ [ 'serif', 'sans-serif', 'cursive', 'monospace' ] }
                    id='input-font-weight'
                />
            </PopoverContent>
        </Popover>
    );
};

export default FontInput;