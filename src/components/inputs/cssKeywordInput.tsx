'use client';

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface CssKeywordInputProps {
    value: string;
    onChange: (newValue: string) => void;
    options: string[];
    id: string;
};

const CssKeywordInput: React.FC<CssKeywordInputProps> = ({
    value,
    onChange,
    options,
    id
}) => (
    <Select onValueChange={ onChange } value={ value }>
        <SelectTrigger id={ id } className='w-[100%]'>
            <SelectValue />
        </SelectTrigger>
        <SelectContent>
            { options.map((option) => (
                <SelectItem key={ option } value={ option }>
                    { option.replaceAll('-', ' ') }
                </SelectItem>
            )) }
        </SelectContent>
    </Select>
);

export default CssKeywordInput;