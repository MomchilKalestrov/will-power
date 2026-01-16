'use client';
import React from 'react';

import { Button } from '@/components/ui/button';

import { useFileSelector } from '@/contexts/file';
import { fileTypes } from '@/contexts/file/fileFormats';
import { FilePlus, FilePlusIcon } from 'lucide-react';

type Props = {
    id?: string | undefined;
    value: string;
    onChange: (value: string) => void;
    type?: fileTypes | undefined;
};

const FileInput: React.FC<Props> = ({ id, value, onChange, type = 'all' }) => {
    const { selectFile } = useFileSelector();
    const name = React.useMemo(() => value.split('/').pop() ?? '', [ value ]);

    const onClick = React.useCallback(() =>
        selectFile('single', type)
            .then(([ file ]) => onChange(file.pathname))
            .catch(() => null)
    , [ selectFile, onChange ]);

    return (
        <Button
            id={ id }
            className='text-ellipsis grid grid-cols-[auto_1fr] content-start'
            onClick={ onClick }
            variant='outline'
        >
            <FilePlus />
            { name.length === 0 ? <span className='text-primary/50'>...</span> : name }
        </Button>
    );
};

export default FileInput