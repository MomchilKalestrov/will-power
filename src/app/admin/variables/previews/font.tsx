'use client';
import React from 'react';

import { fontToCss } from '@/lib/utils';

type Props = {
    config: config;
};

const FontPreview: React.FC<Props> = ({ config }) => {
    const fonts = React.useMemo(() =>
        config.variables.filter(({ type }) =>
            type === 'font'
        ) as fontVariable[],
        [ config.variables ]
    );

    return (
        <div className='space-y-6'>
            { fonts.map((font) => (
                <p
                    key={ font.id }
                    className={ `text-muted-foreground text-sm overflow-scroll text-nowrap max-h-[${ font.size }]` }
                    style={ { font: fontToCss(font) } }
                >{ font.name }</p>
            ))}
        </div>
    );
};

export default FontPreview;