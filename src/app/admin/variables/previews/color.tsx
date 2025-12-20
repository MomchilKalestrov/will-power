'use client';
import React from 'react';

import { Card } from '@/components/ui/card';

import { hexToHsl, hslToHex } from '@/lib/color';

type Props = {
    config: config;
};

const ColorPreview: React.FC<Props> = ({ config }) => {
    const colorVariables = React.useMemo(() =>
        config.variables.filter(v => v.type === 'color'),
        [ config.variables ]
    );
    
    return (
        <div className='flex flex-wrap gap-4'>
            { colorVariables.map(({ id, color, name }) => {
                const [ h, s, l ] = hexToHsl(color);
                const foregroundHex = hslToHex(h, s / 2, l > 50 ? 20 : 80);

                return(
                    <div key={ id } className='basis-32 grow max-w-64 text-center'>
                        <Card
                            className='w-full aspect-video flex justify-end items-start p-4 gap-2'
                            style={ { backgroundColor: color, color: foregroundHex } }
                        >
                            <p className='text-sm font-medium'>{ name }</p>
                            <p className='text-xs opacity-75'>{ color }</p>
                        </Card>
                    </div>
                );
            }) }
        </div>
    );
};

export default ColorPreview;