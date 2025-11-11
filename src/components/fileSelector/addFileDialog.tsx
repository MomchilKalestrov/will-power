'use client';
import React from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogTitle,
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Props = {
    onSend: (file: File) => void;
    accepts?: string | undefined;
};

const AddFileDialog: React.FC<Props> = ({ onSend, accepts }) => {
    const [ file, setFile ] = React.useState<File | undefined>();
    const [ dialogOpen, setDialogOpen ] = React.useState<boolean>(false);

    return (
        <Dialog open={ dialogOpen } onOpenChange={ setDialogOpen }>
            <DialogTrigger asChild>
                <Button variant='outline' size='icon'><Plus /></Button>
            </DialogTrigger>
            <DialogContent className='z-101'>
                <DialogHeader>
                    <DialogTitle>Upload</DialogTitle>
                    <DialogDescription>
                        Select a file to add to the assets.
                    </DialogDescription>
                </DialogHeader>
                <Input
                    type='file'
                    multiple={ false }
                    accept={ accepts }
                    onChange={ ({ currentTarget: { files } }) =>
                        setFile([ ...files! ][0])
                    }
                />
                <Button
                    onClick={ () => {
                        setDialogOpen(false);
                        onSend(file!);
                    } }
                    disabled={ !file }
                    variant='outline'
                >Upload</Button>
            </DialogContent>
        </Dialog>
    );
};

export default AddFileDialog;