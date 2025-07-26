'use client';
import React from 'react';
import { Image as ImageIcon, Minus, Plus } from 'lucide-react';
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

    const updateColors = (newColor: string, index: number) => {
        const newColors = [ ...gradientColors ];
        newColors[ index ] = newColor;
        setColors(newColors);
        onChange({ colors: newColors });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={ selected ? 'outline' : 'ghost' } size='icon' className='size-8 p-2'>
                    <ImageIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className='flex flex-col gap-2'
                onInteractOutside={ (e) => e.preventDefault() }
            >
                <div className='grid grid-cols-2 gap-2'>
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
                            <Label>Color { index + 1 }</Label>
                            <ColorPicker
                                value={ value }
                                onChange={ (newValue) => updateColors(newValue, index) }
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
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default GradientPicker;