'use client';
import React from 'react';
import { toast } from 'sonner';
import { CirclePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { createComponent } from '@/lib/db/actions';

type Props = {
    components: string[];
    type: componentType;
};

const CreateComponentDialog: React.FC<Props> = ({
    components,
    type
}) => {
    const router = useRouter();
    const [ name, setName ] = React.useState<string>('');

    const onPageCreated = React.useCallback(async () => {
        const response = await createComponent(name, type);
        if(!response.success)
            return toast(`Failed to create the ${ type }: ` + response.reason);
        router.push('/admin/editor/' + name);
    }, [ name, type ]);

    const validInput =
        name === encodeURIComponent(name) &&
        name.length !== 0 &&
        !components.includes(name) &&
        !(name === 'admin' && type === 'page');

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className='w-48.5 aspect-[384/284.883] basis-64 grow max-w-96 text-center flex justify-center items-center rounded-xl border-2 border-dashed'>
                    <CirclePlus className='opacity-20' size={ 32 } />
                </div>
            </DialogTrigger>
            <DialogContent className='max-w-[256px_!important]'>
                <DialogHeader>
                    <DialogTitle>Create new { type }</DialogTitle>
                    <DialogDescription>
                        Give the new { type } a name. The name cannot be changed after creation.
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-2 grid-cols-[auto_1fr]'>
                    <Input
                        className='col-span-full'
                        id='input-new-page-name'
                        placeholder='Name'
                        value={ name }
                        onChange={ ({ target: { value } }) => setName(value.toLowerCase()) }
                    />
                    {
                        !validInput &&
                        <p className='col-span-full text-xs font-medium text-red-900'>Name is invalid</p>
                    }
                    <DialogClose asChild>
                        <Button variant='outline'>Close</Button>
                    </DialogClose>
                    <Button disabled={ !validInput } onClick={ onPageCreated }>
                        Create
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateComponentDialog;