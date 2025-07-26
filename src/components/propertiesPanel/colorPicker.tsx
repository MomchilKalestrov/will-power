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
    preview?: boolean;
};

const ColorPicker: React.FC<Props> = ({ value: initialColor, selected = true, onChange: onChangeCallback, preview = false }) => {
    const [ color, setColor ] = React.useState<string>('#ffffff');

    React.useEffect(() => {
        if (!initialColor.startsWith('#')) return;
        setColor(initialColor);
    }, []);

    const onChange = (newColor: string) => {
        setColor(newColor);
        onChangeCallback(newColor);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                {
                    preview
                    ?   <div className='flex gap-2 items-stretch'>
                            <div className='flex-grow bg-card text-card-foreground rounded-md border shadow-sm p-1'>
                                <div className='size-full' style={ { borderRadius: 4, backgroundColor: color } } />
                            </div>
                            <Button variant={ selected ? 'outline' : 'ghost' } size='icon' className='size-8 p-2'>
                                <PaintbrushVertical />
                            </Button>
                        </div>
                    :   <Button variant={ selected ? 'outline' : 'ghost' } size='icon' className='size-8 p-2'>
                            <PaintbrushVertical />
                        </Button>
                }
            </PopoverTrigger>
            <PopoverContent
                className='flex flex-col gap-2'
                onInteractOutside={ (e) => e.preventDefault() }
            >
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