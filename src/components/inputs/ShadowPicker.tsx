'use client';
import React from 'react';
import { SquircleDashed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import CssUnitInput from './cssUnitInput';
import ColorPicker from './colorPicker';

type Props = {
    value: string;
    selected?: boolean;
    onChange: (newValue: string) => void;
};

const ShadowPicker: React.FC<Props> = ({
    value: initialShadow,
    selected = true,
    onChange: onChangeCallback
}) => {
    const [ shadowInset,  setInset  ] = React.useState<boolean>(false);
    const [ shadowOffset, setOffset ] = React.useState<string>('0px 0px');
    const [ shadowBlur,   setBlur   ] = React.useState<string>('0px');
    const [ shadowSpread, setSpread ] = React.useState<string>('0px');
    const [ shadowColor,  setColor  ] = React.useState<string>('#ffffff');

    React.useEffect(() => {
        if (initialShadow === 'unset' || initialShadow === 'none') return;

        let parts = initialShadow.split(' ');
        if (parts[ 0 ] === 'inset') {
            setInset(true);
            parts = parts.slice(1);
        }
        const [ offsetX, offsetY, blur, spread, color ] = parts;
        setOffset(offsetX + ' ' + offsetY);
        setBlur(blur);
        setSpread(spread);
        setColor(color);
    }, []);

    type ShadowChangeParams = {
        inset?: boolean,
        offset?: string,
        blur?: string,
        spread?: string,
        color?: string
    };

    const onChange = ({
        inset = shadowInset,
        offset = shadowOffset,
        blur = shadowBlur,
        spread = shadowSpread,
        color = shadowColor

    }: ShadowChangeParams) =>
        onChangeCallback(`${ inset ? 'inset ' : '' }${ offset } ${ blur } ${ spread } ${ color }`);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={ selected ? 'outline' : 'ghost' } size='icon'>
                    <SquircleDashed />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className='grid grid-cols-2 gap-2'
                style={ { gridTemplateColumns: 'min-content 1fr' } }
                onInteractOutside={ (e) => e.preventDefault() }
            >
                <Label htmlFor='input-shadow-inset' className='capitalize w-16'>Inset</Label>
                <Checkbox
                    className='justify-self-end'
                    id='input-shadow-inset'
                    checked={ shadowInset }
                    onCheckedChange={ (checked) => {
                        const inset = checked === 'indeterminate' ? !shadowInset : checked;
                        setInset(inset);
                        onChange({ inset });
                    } }
                />
                <Label htmlFor='input-shadow-offset' className='capitalize w-16'>Offset</Label>
                <CssUnitInput
                    value={ shadowOffset }
                    count={ 2 }
                    units={ [ 'px', 'cm', 'in', 'em', 'rem' ] }
                    onChange={ (offset) => {
                        setOffset(offset);
                        onChange({ offset });
                    } }
                />
                <Label htmlFor='input-shadow-blur' className='capitalize w-16'>Blur</Label>
                <CssUnitInput
                    value={ shadowBlur }
                    units={ [ 'px', 'cm', 'in', 'em', 'rem' ] }
                    onChange={ (blur) => {
                        setBlur(blur);
                        onChange({ blur });
                    } }
                />
                <Label htmlFor='input-shadow-spread' className='capitalize w-16'>Spread</Label>
                <CssUnitInput
                    value={ shadowSpread }
                    units={ [ 'px', 'cm', 'in', 'em', 'rem' ] }
                    onChange={ (spread) => {
                        setSpread(spread);
                        onChange({ spread })
                    } }
                />
                <Label htmlFor='input-shadow-color' className='capitalize w-16'>Color</Label>
                <ColorPicker
                    value={ shadowColor }
                    onChange={ (color) => {
                        setColor(color);
                        onChange({ color });
                    } }
                    preview={ true }
                />
            </PopoverContent>
        </Popover>
    );
};

export default ShadowPicker;