'use client';
import React from 'react';
import { PaintbrushVertical } from 'lucide-react';
import { HexAlphaColorPicker } from 'react-colorful';
import type { config } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useConfig } from '@/components/configProvider';

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
    const [ color, setColor ] = React.useState<string>();
    const { config } = useConfig();
    const [ variable, setVariable ] = React.useState<config[ 'variables' ][ number ]>();
    const [ variables, setVariables ] = React.useState<(config[ 'variables' ][ number ])[]>([]);

    React.useEffect(() => {
        if (!initialColor.startsWith('#')) return;
        setColor(initialColor);
    }, []);

    React.useEffect(() => {
        if (!config) return;
        const variables = config.variables.filter(variable => variable.type === 'color');
        console.log(variables)
        setVariables(variables);
        
        if (color || !initialColor.startsWith('var(--')) return;
        const variableId = initialColor.substring(6, initialColor.length - 1);
        const variable = variables.find(variable => variableId === variable.id);
        
        if (!variable) return;
        setVariable(variable);
        setColor(variable.color);
    }, [ config ]);

    const onVariableChange = (variableId: string) => {
        const newVariable = variables.find(variable => variable.id === variableId);
        setVariable(newVariable);
        const color = (newVariable as typeof newVariable & { color: string }).color;
        setColor(color);
        onChangeCallback(`var(--${ newVariable?.id })`);
    };

    const onColorChange = (newColor: string) => {
        setVariable(undefined);
        setColor(newColor);
        onChangeCallback(newColor);
    };

    const showVars = (variables.length !== 0) || !noVars;

    return (
        <Popover>
            <PopoverTrigger asChild>
                {
                    preview
                    ?   <div className='flex gap-2 items-stretch'>
                            <div className='flex-grow bg-card text-card-foreground rounded-md border shadow-sm p-1'>
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
            <PopoverContent className={ `grid ${ showVars ? 'grid-cols-[1fr_9ch]' : 'grid-cols-1' } gap-2` }>
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
                <Input value={ color } onChange={ (e) => onColorChange(e.target.value) } />
            </PopoverContent>
        </Popover>
    );
};

export default ColorPicker;