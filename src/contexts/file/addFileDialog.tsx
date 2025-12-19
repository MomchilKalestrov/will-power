'use client';
import React from 'react';
import { Plus } from 'lucide-react';

import {
    Dialog,
    DialogTitle,
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

type Props = {
    onSend: (file: File) => void;
    accepts?: string | undefined;
};

const AddFileDialog: React.FC<Props> = ({ onSend, accepts }) => {
    const [ file, setFile ] = React.useState<File | undefined>();
    const [ dialogOpen, setDialogOpen ] = React.useState<boolean>(false);
    
    const [ isDirectory, setIsDirectory ] = React.useState<boolean>(false);
    const [ directoryName, setDirectoryName ] = React.useState<string>('');

    return (
        <Dialog open={ dialogOpen } onOpenChange={ setDialogOpen }>
            <DialogTrigger asChild>
                <Button variant='outline' size='icon'><Plus /></Button>
            </DialogTrigger>
            <DialogContent className='z-101'>
                <DialogHeader>
                    <DialogTitle>{ isDirectory ? 'Create' : 'Upload' }</DialogTitle>
                    <DialogDescription>
                        {
                            isDirectory
                            ?   'Give the new directory a name.'
                            :   'Select a file to add to the assets.'
                        }
                    </DialogDescription>
                </DialogHeader>
                {
                    isDirectory
                    ?   <Input
                            value={ directoryName }
                            onChange={ ({ currentTarget: { value } }) =>
                                setDirectoryName(value)
                            }
                        />
                    :   <Input
                            type='file'
                            multiple={ false }
                            accept={ accepts }
                            onChange={ ({ currentTarget: { files } }) =>
                                setFile([ ...files! ][0])
                            }
                        />
                }
                <div className='flex gap-1'>
                    <Checkbox
                        checked={ isDirectory }
                        onCheckedChange={ checked =>
                            setIsDirectory(checked === true)
                        }
                        name='is-directory-checkbox'
                        id='is-directory-checkbox'
                    />
                    <Label htmlFor='is-directory-checkbox'>Create directory</Label>
                </div>
                <Button
                    onClick={ () => {
                        setDialogOpen(false);
                        if (isDirectory)
                            onSend(new File([], directoryName + '/'));
                        else
                            onSend(file!);
                    } }
                    disabled={ isDirectory ? !directoryName : !file }
                    variant='outline'
                >{ isDirectory ? 'Create' : 'Upload' }</Button>
            </DialogContent>
        </Dialog>
    );
};

export default AddFileDialog;