'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type Props = {
    onSelect?: () => void;
    onDelete: () => void;
    file: BlobInformation;
};

const toFileSize = (value: number): string => {
    const units = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB' ];
    let unitIndex = 0;
    while (value > 1000) {
        value = Math.round(value / 100) / 10;
        if (++unitIndex >= units.length - 1) break;
    };
    return value + ' ' + units[ unitIndex ];
};

const SelectedFilePanel: React.FC<Props> = ({
    onSelect,
    onDelete,
    file
}) => (
    <section className='flex'>
        <Separator orientation='vertical' className='mx-4' />
        <div className='w-64 grow flex flex-col justify-between'>
            <section className='grid gap-2'>
                <p>
                    <strong>Name:</strong><br></br>
                    { file.pathname.split('/').pop() }
                </p>
                <p>
                    <strong>Size:</strong><br></br>
                    { toFileSize(file.size) }
                </p>
                <div>
                    <p><strong>URL:</strong></p>
                    <div className='overflow-scroll w-64'>
                        <code className='text-nowrap'>{ file.url }</code>
                    </div>
                </div>
            </section>
            <div className='grid gap-2'>
                <Button
                    variant='destructive'
                    onClick={ onDelete }
                >Delete</Button>
                { onSelect && <Button onClick={ onSelect }>Select</Button> }
            </div>
        </div>
    </section>
);

export default SelectedFilePanel;