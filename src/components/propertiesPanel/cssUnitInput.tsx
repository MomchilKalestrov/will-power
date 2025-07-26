'use client';
import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input';

const CssUnitInput: React.FC<{
    value: string;
    units: string[];
    onChange: (newValue: string) => void;
    count?: number;
}> = ({ value, units, onChange, count = 1 }) => {
    const [ currentValues, setCurrentValues ] = React.useState<string[]>([]);
    const [ currentUnit, setCurrentUnit ] = React.useState<string>('');

    React.useEffect(() => {
        let detectedUnit: string;
        if (value.length !== 0)
            if (!value.includes('('))
                detectedUnit = units.find(u => value && value.includes(u)) || 'custom';
            else
                detectedUnit = 'custom';
        else
            detectedUnit = units[ 0 ];

        setCurrentUnit(detectedUnit);

        if (detectedUnit !== 'custom' && value) {
            const parts = value.split(' ').map(p => p.replace(detectedUnit, ''));
            setCurrentValues(Array.from({ length: count }, (_, i) => parts[ i ] || ''));
        } else {
            const customValues = Array(count).fill('');
            if (value) customValues[ 0 ] = value;
            setCurrentValues(customValues);
        }
    }, [ value, units, count ]);

    // Reconstruct the full value when either part changes
    const triggerChange = (newValues: string[], newUnit: string) => {
        if (newUnit === 'custom') {
            onChange(newValues[ 0 ] || ''); // For custom, only use the first input
        } else {
            const combined = newValues
                .slice(0, count)
                .map((v) => `${ parseFloat(v) || 0 }${ newUnit }`)
                .join(' ');
            onChange(combined);
        }
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newValues = [ ...currentValues ];
        newValues[ index ] = e.target.value;
        setCurrentValues(newValues);
        triggerChange(newValues, currentUnit);
    };

    const handleUnitChange = (newUnit: string) => {
        setCurrentUnit(newUnit);
        triggerChange(currentValues, newUnit);
    };

    return (
        <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 w-full'>
                {
                    currentUnit === 'custom'
                    ?   (
                        <Input
                            type='text'
                            value={ currentValues[ 0 ] || '' }
                            onChange={(e) => handleValueChange(e, 0)}
                        />
                    )
                    :   (
                        Array.from({ length: count }).map((_, index) => (
                            <Input
                                key={index}
                                type='number'
                                value={ currentValues[index] || '0' }
                                onChange={(e) => handleValueChange(e, index) }
                                className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                            />
                        ))
                    )
                }
            </div>
            <Select value={ currentUnit } onValueChange={ handleUnitChange }>
                <SelectTrigger className='w-[80px]'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    { units.map((unit) => (
                        <SelectItem key={ unit } value={ unit }>
                            { unit }
                        </SelectItem>
                    )) }
                    <SelectItem value='custom'>custom</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

export default CssUnitInput;