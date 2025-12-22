'use client';
import React from 'react';
import { PaintbrushVertical } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

import { useConfig } from '@/contexts/config';

import { hexToHsv, hsvToHex } from '@/lib/color';

const BaseColorPicker: React.FC<{
    value: string;
    onChange: (value: string) => void;
}> = ({ value, onChange }) => {
    const [ h, s, v, a ] = React.useMemo(() => {
            const hsv = hexToHsv(value);
            const opacity = parseInt(value.slice(7, 9), 16)
            return [ ...hsv, isNaN(opacity) ? 100 : opacity / 255 * 100 ]
        },
        [ value ]
    );
    
    const onColorChange = React.useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.x;
        const y = event.clientY - rect.y;
        const { width, height } = rect;

        const relativeX = Math.min(1, Math.max(0, x / width));
        const relativeY = Math.min(1, Math.max(0, 1 - y / height));

        const hSector = (((h % 360) + 360) % 360) / 60;
        const alpha = Math.round((a / 100 * 255)).toString(16);
        onChange(hsvToHex(hSector, relativeX, relativeY) + alpha);
    }, [ onChange, h, a ]);

    const onOpacityChange = React.useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.x;
        const { width } = rect;

        const alpha = Math.round(x / width * 255).toString(16).padStart(2, '0');
        onChange(value.substring(0, value.length - 2) + alpha)
    }, [ onChange, value ]);

    const onHueChange = React.useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.x;
        const { width } = rect;
        const relativeX = Math.min(1, Math.max(0, x / width));

        const hSector = relativeX * 6;
        const alpha = Math.round((a / 100 * 255)).toString(16);
        
        console.log(hsvToHex(hSector, s / 100, v / 100) + alpha)
        onChange(hsvToHex(hSector, s / 100, v / 100) + alpha);
    }, [ onChange, s, v, a ]);

    return (
        <div className='w-full col-span-full'>
            <div
                className='aspect-3/2 rounded-t-sm'
                style={ {
                    background:
                        'linear-gradient(transparent, black),' +
                        `linear-gradient(to right, white 0%, hsl(${ h }deg 100% 50%) 100%)`
                } }
                onClick={ onColorChange }
            >
                <Card
                    className='relative size-4 p-0'
                    style={ {
                        top: `${ 100 - v }%`,
                        left: `${ s }%`,
                        transform: 'translate(-50%, -50%)'
                    } }
                />
            </div>
            <div
                className='h-4'
                style={ {
                    background:
                        'linear-gradient(to right, transparent, black),' +
                        'repeating-conic-gradient(#a0a0a0 0 25%, white 0 50%) 50% / 8px 8px'
                } }
                onClick={ onOpacityChange }
            >
                <Card
                    className='relative size-4 p-0'
                    style={ {
                        top: '50%',
                        left: `${ a }%`,
                        transform: 'translate(-50%, -50%)'
                    } }
                />
            </div>
            <div
                className='h-4 rounded-b-sm'
                style={ {
                    background:
                        'linear-gradient(' +
                        '   90deg,' +
                        '   rgba(255, 0, 0, 1) 0%,' +
                        '   rgba(255, 154, 0, 1) 10%,' +
                        '   rgba(208, 222, 33, 1) 20%,' +
                        '   rgba(79, 220, 74, 1) 30%,' +
                        '   rgba(63, 218, 216, 1) 40%,' +
                        '   rgba(47, 201, 226, 1) 50%,' +
                        '   rgba(28, 127, 238, 1) 60%,' +
                        '   rgba(95, 21, 242, 1) 70%,' +
                        '   rgba(186, 12, 248, 1) 80%,' +
                        '   rgba(251, 7, 217, 1) 90%,' +
                        '   rgba(255, 0, 0, 1) 100%' +
                        ')'
                } }
                onClick={ onHueChange }
            >
                <Card
                    className='relative size-4 p-0'
                    style={ {
                        top: '50%',
                        left: `${ (h / 360) * 100 }%`,
                        transform: 'translate(-50%, -50%)'
                    } }
                />
            </div>
        </div>
    );
};

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
    const [ color, setColor ] = React.useState<string>('#ff0000ff');
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
            <PopoverContent className={ `grid ${ showVars ? 'grid-cols-[1fr_9ch]' : 'grid-cols-1' } gap-2` }>
                <BaseColorPicker
                    value={ color }
                    onChange={ onColorChange }
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