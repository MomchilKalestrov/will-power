'use client';
import React from 'react';
import { PaintbrushVertical } from 'lucide-react';
import { HexAlphaColorPicker } from 'react-colorful';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

import { useConfig } from '@/contexts/config';

type Props = {
    value: string;
    selected?: boolean;
    onChange: (newValue: string) => void;
    preview?: boolean;
    noVars?: boolean;
    className?: string;
};

const ColorPicker: React.FC<Props> = ({
    value: initialColor,
    selected = true,
    onChange: onChangeCallback,
    preview = false,
    noVars = false
}) => {
    const [ color, setColor ] = React.useState<string>('#ffffffff');
    const { config } = useConfig();
    const [ variable, setVariable ] = React.useState<config[ 'variables' ][ number ]>();
    const [ variables, setVariables ] = React.useState<(config[ 'variables' ][ number ])[]>([]);

    React.useEffect(() => {
        if (!initialColor.startsWith('#')) return;
        setColor(initialColor);
    }, []);

    React.useEffect(() => {
        const variables = config.variables.filter(variable => variable.type === 'color');
        setVariables(variables);
        
        if (color || !initialColor.startsWith('var(--')) return;
        const variableId = initialColor.substring(6, initialColor.length - 1);
        const variable = variables.find(variable => variableId === variable.id);
        
        if (!variable) return;
        setVariable(variable);
        setColor(variable.color);
    }, []);

    const onVariableChange = React.useCallback((variableId: string) => {
        const newVariable = variables.find(({ id }) => id === variableId);
        if (!newVariable) return;
        setVariable(newVariable);
        const color = (newVariable as typeof newVariable & { color: string }).color;
        setColor(color);
        onChangeCallback(`var(--${ newVariable.id })`);
    }, [ variables, onChangeCallback ]);

    const onColorChange = React.useCallback((newColor: string) => {
        setVariable(undefined);
        setColor(newColor);
        onChangeCallback(newColor);
    }, [ onChangeCallback ]);

    const showVars = (variables.length !== 0) || !noVars;
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                {
                    preview
                    ?   <div className='flex gap-2 items-stretch'>
                            <div className='grow bg-card text-card-foreground rounded-md border shadow-sm p-1 min-w-9'>
                                <div className='size-full' style={ { borderRadius: 4, backgroundColor: color } } />
                            </div>
                            <Button variant={ selected ? 'outline' : 'ghost' } size='icon'>
                                <PaintbrushVertical />
                            </Button>
                        </div>
                    :   <Button variant={ selected ? 'outline' : 'ghost' } size='icon'>
                            <PaintbrushVertical />
                        </Button>
                }
            </PopoverTrigger>
            <PopoverContent className={ `grid ${ showVars ? 'grid-cols-[1fr_calc(9ch+1.125rem+1px)]' : 'grid-cols-1' } gap-2` }>
                <HexAlphaColorPicker
                    color={ color }
                    onChange={ onColorChange }
                    className='col-span-full'
                    style={ { width: '100%' } }
                />
                {
                    showVars &&
                    <Select onValueChange={ onVariableChange } value={ variable?.id }>
                        <SelectTrigger className='w-full'>
                            { variable?.name ?? 'Variables' }
                        </SelectTrigger>
                        <SelectContent>
                            { variables.map((variable: config[ 'variables' ][ number ]) => (
                                <SelectItem key={ variable.id } value={ variable.id }>
                                    { variable.name }
                                </SelectItem>
                            )) }
                        </SelectContent>
                    </Select>
                }
                <Input
                    value={ color }
                    onChange={ e => onColorChange(e.target.value) }
                    className='font-mono'
                />
            </PopoverContent>
        </Popover>
    );
};

export default ColorPicker;