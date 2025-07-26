'use client';
import React from 'react';
import { PaintbrushVertical } from 'lucide-react';
import { HexAlphaColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

type Props = {
    value: string;
    selected?: boolean;
    onChange: (newValue: string) => void;
};

const ColorPicker: React.FC<Props> = ({ value: initialColor, selected = true, onChange: onChangeCallback }) => {
    const [ color, setColor ] = React.useState<string>('');

    React.useEffect(() => {
        setColor(initialColor.startsWith('#') ? initialColor : '#ffffff');
    }, []);

    const onChange = (newColor: string) => {
        setColor(newColor);
        onChangeCallback(newColor);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={ selected ? 'outline' : 'ghost' } size='icon' className='size-8 p-2'>
                    <PaintbrushVertical />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='flex flex-col gap-2'>
                <HexAlphaColorPicker
                    color={ color }
                    onChange={ onChange }
                    style={ { width: '100%' } }
                />
                <Input value={ color } onChange={ (e) => onChange(e.target.value) } />
            </PopoverContent>
        </Popover>
    );
};

export default ColorPicker;