'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { SquareAsterisk } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import ColorPicker from './colorPicker';
import CssUnitInput from './cssUnitInput';
import CssKeywordInput from './cssKeywordInput';

const BORDER_STYLES = [
    'none', 'solid', 'dashed', 'dotted',
    'double', 'groove', 'ridge', 'inset', 'outset'
];

type Props = {
    value: string;
    selected?: boolean;
    onChange: (newValue: string) => void;
};

const BorderPicker: React.FC<Props> = ({
    value: initialBorder,
    selected = true,
    onChange: onChangeCallback
}) => {
    const t = useTranslations('Inputs');
    const [ borderWidth, setWidth ] = React.useState<string>('0px');
    const [ borderStyle, setStyle ] = React.useState<string>('solid');
    const [ borderColor, setColor ] = React.useState<string>('#000000ff');

    React.useEffect(() => {
        if (initialBorder === 'unset' || initialBorder === 'none' || !initialBorder) return;

        const parts = initialBorder.split(' ');
        if (parts.length >= 1) setWidth(parts[0]);
        if (parts.length >= 2) setStyle(parts[1]);
        if (parts.length >= 3) setColor(parts.slice(2).join(' '));
    }, []);

    type BorderChangeParams = {
        width?: string;
        style?: string;
        color?: string;
    };

    const onChange = ({
        width = borderWidth,
        style = borderStyle,
        color = borderColor
    }: BorderChangeParams) =>
        onChangeCallback(`${ width } ${ style } ${ color }`);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={ selected ? 'outline' : 'ghost' } size='icon'>
                    <SquareAsterisk />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='grid gap-2 grid-cols-[min-content_1fr]'>
                <Label htmlFor='input-border-width' className='capitalize w-16'>{ t('width') }</Label>
                <CssUnitInput
                    value={ borderWidth }
                    units={ [ 'px', 'em', 'rem' ] }
                    onChange={ (width) => {
                        setWidth(width);
                        onChange({ width });
                    } }
                />
                <Label htmlFor='input-border-style' className='capitalize w-16'>{ t('style') }</Label>
                <CssKeywordInput
                    value={ borderStyle }
                    options={ BORDER_STYLES }
                    id='input-border-style'
                    onChange={ (style) => {
                        setStyle(style);
                        onChange({ style });
                    } }
                />
                <Label htmlFor='input-border-color' className='capitalize w-16'>{ t('color') }</Label>
                <ColorPicker
                    value={ borderColor }
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

export default BorderPicker;
