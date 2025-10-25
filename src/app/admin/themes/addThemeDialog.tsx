'use client';
import React from 'react';
import { CirclePlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { useThemes } from '@/components/themesProvider';

const AddThemeDialog: React.FC = () => {
    const { addTheme } = useThemes();
    const [ file, setFile ] = React.useState<File | undefined>();
    const [ dialogOpen, setDialogOpen ] = React.useState<boolean>(false);

    const onSend = React.useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (event.currentTarget)
            event.currentTarget.disabled = true;

        const response = await addTheme!(file!);
        toast(response);

        if (event.currentTarget)
            event.currentTarget.disabled = false;
        setDialogOpen(false);
    }, [ file ]);

    return (

        <Dialog open={ dialogOpen } onOpenChange={ setDialogOpen }>
            <DialogTrigger asChild>
                <div className='w-[194px] aspect-[384/276.883] basis-64 grow max-w-96 text-center flex justify-center items-center rounded-xl border-2 border-dashed'>
                    <CirclePlus className='opacity-20' size={ 32 } />
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload</DialogTitle>
                    <DialogDescription>
                        Select an <code>.zip</code> archive to upload as a theme.
                        The archive must contain a <code>metadata.json</code>{ ' ' }
                        and <code>index.css</code> file inside.
                    </DialogDescription>
                </DialogHeader>
                <Input
                    type='file'
                    accept='.zip'
                    multiple={ false }
                    onChange={ ({ currentTarget: { files } }) =>
                        setFile([ ...files! ][ 0 ])
                    }
                />
                <Button
                    onClick={ onSend }
                    disabled={ !file }
                    variant='outline'
                >Upload</Button>
            </DialogContent>
        </Dialog>
    );
};

export default AddThemeDialog;