'use client';
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CssKeywordInput from './cssKeywordInput';
import ColorPicker from './colorPicker';

const positions = [
    'top left',    'top center',    'top right',
    'center left', 'center center', 'center right',
    'bottom left', 'bottom center', 'bottom right'
];

type Props = {
    value: string;
    selected?: boolean;
    onChange: (newValue: string) => void;
};

const GradientPicker: React.FC<Props> = ({
    value: initialGradient,
    selected = true,
    onChange: onChangeCallback
}) => {
    const [ gradientType, setGradientType ] = React.useState<'linear' | 'radial'>('linear');
    const [ gradientPosition, setGradientPosition ] = React.useState<string>('center center');
    const [ gradientRotation, setGradientRotation ] = React.useState<string>('0');
    const [ gradientColors, setColors ] = React.useState<string[]>([ '#ffffffff', '#000000ff' ]);

    React.useEffect(() => {
        if (!initialGradient.includes('-gradient(')) return;

        const type: 'linear' | 'radial' = initialGradient.split('-')[ 0 ] as 'linear' | 'radial';
        const [ posOrRot, ...colors ]: string[] =
            initialGradient
                .substring(
                    initialGradient.indexOf('(') + 1,
                    initialGradient.length - 1
                )
                .split(', ');
        setGradientType(type);
        setColors(colors);
        if (type === 'linear')
            setGradientRotation(posOrRot.substring(0, posOrRot.length - 3));
        else
            setGradientPosition(posOrRot.split(' ').slice(1).join(' '));
    }, []);
    
    type GradientChangeParams = {
        type?: 'linear' | 'radial';
        position?: string;
        rotation?: string;
        colors?: string[];
    };

    const onChange = ({
        type = gradientType,
        position = gradientPosition,
        rotation = gradientRotation,
        colors = gradientColors
    }: GradientChangeParams) =>
        onChangeCallback(`${ type }-gradient(${ type === 'linear' ? rotation + 'deg' : 'at ' + position }, ${ colors.join(', ') })`);

    const updateColors = React.useCallback((newColor: string, index: number) => {
        const newColors = [ ...gradientColors ];
        newColors[ index ] = newColor;
        setColors(newColors);
        onChange({ colors: newColors });
    }, [ gradientColors ]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={ selected ? 'outline' : 'ghost' } size='icon'>
                    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <rect width='16' height='16' rx='2' fill='url(#paint0_linear_335_2)'/>
                        <defs>
                            <linearGradient id='paint0_linear_335_2' x1='8' y1='0' x2='8' y2='16' gradientUnits='userSpaceOnUse'>
                                <stop stopOpacity='0'/>
                                <stop offset='1' stopColor='currentColor'/>
                            </linearGradient>
                        </defs>
                    </svg>
                </Button>
            </PopoverTrigger>
            <PopoverContent className='grid grid-cols-2 gap-2'>
                <Label htmlFor='input-gradient-type' className='capitalize w-32'>Type</Label>
                <CssKeywordInput
                    value={ gradientType }
                    options={ [ 'linear', 'radial' ] }
                    id='input-gradient-type'
                    onChange={ (type) => {
                        setGradientType(type as 'linear' | 'radial');
                        onChange({ type: type as 'linear' | 'radial' });
                    } }
                />
                {
                    gradientType === 'linear'
                    ?   <React.Fragment>
                            <Label htmlFor='input-gradient-rotation' className='capitalize w-32'>Rotation</Label>
                            <Input
                                type='number'
                                id='input-gradient-rotation'
                                min={ -360 }
                                max={ 360 }
                                defaultValue={ gradientRotation }
                                className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                onChange={ ({ target: { value: rotation } }) => {
                                    setGradientRotation(rotation);
                                    onChange({ rotation });
                                } }
                            />
                        </React.Fragment>
                    :   <React.Fragment>
                            <Label htmlFor='input-gradient-position' className='capitalize w-32'>Position</Label>
                            <CssKeywordInput
                                value={ gradientPosition }
                                options={ positions }
                                id={ 'input-gradient-position' }
                                onChange={ (position) => {
                                    setGradientPosition(position);
                                    onChange({ position });
                                } }
                            />
                        </React.Fragment>
                }
                { gradientColors.map((value, index) => (
                    <React.Fragment key={ index }>
                        <Label>Color { gradientColors.length - index }</Label>
                        <ColorPicker
                            value={ value }
                            onChange={ (newValue) => updateColors(newValue, index) }
                            preview={ true }
                        />
                    </React.Fragment>
                )) }
                <Button
                    variant='outline'
                    onClick={ () => {
                        let colors = [ ...gradientColors ];
                        colors.push('#ffffffff');
                        setColors(colors);
                        onChange({ colors });
                    } }
                ><Plus /></Button>
                <Button
                    variant='outline'
                    onClick={ () => {
                        if (gradientColors.length === 2) return;
                        let colors = [ ...gradientColors ];
                        colors.pop();
                        setColors(colors);
                        onChange({ colors });
                    } }
                ><Minus /></Button>
            </PopoverContent>
        </Popover>
    );
};

export default GradientPicker;