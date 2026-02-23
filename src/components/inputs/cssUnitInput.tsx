'use client';
import React from 'react';

import {
    Select,
    SelectItem,
    SelectValue,
    SelectContent,
    SelectTrigger
} from '@/components/ui/select'
import { Input } from '@/components/ui/input';

type Props = {
    value: string;
    units: string[];
    onChange: (newValue: string) => void;
    count?: number;
    allowCustom?: boolean;
};

const CssUnitInput: React.FC<Props> = ({ value, units, onChange, count = 1, allowCustom = true }) => {
    const [ currentValues, setCurrentValues ] = React.useState<string[]>([]);
    const [ currentUnit, setCurrentUnit ] = React.useState<string>('');

    React.useEffect(() => {
        let detectedUnit: string;
        if (value.length !== 0)
            if (!value.includes('('))
                detectedUnit = units.find(unit => value && value.includes(unit)) || 'custom';
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

    const triggerChange = React.useCallback((newValues: string[], newUnit: string) => {
        if (newUnit === 'custom') {
            onChange(newValues[ 0 ] || '');
        } else {
            const combined = newValues
                .slice(0, count)
                .map((v) => `${ parseFloat(v) || 0 }${ newUnit }`)
                .join(' ');
            onChange(combined);
        }
    }, [ onChange, count ]);

    const handleValueChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newValues = [ ...currentValues ];
        newValues[ index ] = e.target.value;
        setCurrentValues(newValues);
        triggerChange(newValues, currentUnit);
    }, [ currentValues, currentUnit, triggerChange ]);

    const handleUnitChange = React.useCallback((newUnit: string) => {
        setCurrentUnit(newUnit);
        triggerChange(currentValues, newUnit);
    }, [ currentValues, triggerChange, setCurrentUnit ]);

    return (
        <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1 w-full'>
                {
                    currentUnit === 'custom'
                    ?   (
                        <Input
                            type='text'
                            value={ currentValues[ 0 ] || '' }
                            onChange={ e => handleValueChange(e, 0) }
                        />
                    )
                    :   (
                        Array.from({ length: count }).map((_, index) => (
                            <Input
                                key={index}
                                type='number'
                                value={ currentValues[ index ] || '0' }
                                onChange={ e => handleValueChange(e, index) }
                                className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                            />
                        ))
                    )
                }
            </div>
            <Select value={ currentUnit } onValueChange={ handleUnitChange }>
                <SelectTrigger className='w-20'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    { units.map((unit) => (
                        <SelectItem key={ unit } value={ unit }>
                            { unit }
                        </SelectItem>
                    )) }
                    { allowCustom && <SelectItem value='custom'>custom</SelectItem> }
                </SelectContent>
            </Select>
        </div>
    );
};

export default CssUnitInput;