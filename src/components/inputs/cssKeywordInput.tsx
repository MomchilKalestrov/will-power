'use client';

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Props = {
    value: string;
    onChange: (newValue: string) => void;
    options: string[];
    id: string;
};

const CssKeywordInput: React.FC<Props> = ({
    value,
    onChange,
    options,
    id
}) => (
    <Select onValueChange={ onChange } value={ value }>
        <SelectTrigger id={ id } className='w-full'>
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