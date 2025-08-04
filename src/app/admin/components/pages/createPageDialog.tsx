'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { CirclePlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createComponent } from '@/lib/db/actions';
import { toast } from 'sonner';

const CreatePageDialog: React.FC<{ pages: string[] }> = ({ pages }) => {
    const router = useRouter();
    const [ name, setName ] = React.useState<string>('');

    const onPageCreated = React.useCallback(async () => {
        if(!(await createComponent(name, 'page')))
            return toast('Couldn\'t create a page with that name');
        router.push('/admin/editor/' + name);
    }, [ name ]);

    const validInput = name === encodeURIComponent(name) && name.length !== 0 && !pages.includes(name) && name !== 'admin';

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className='w-[194px] aspect-[384/284.883] basis-64 grow max-w-96 text-center flex justify-center items-center rounded-xl border-2 border-dashed'>
                    <CirclePlus color='#e4e4e7' size={ 32 } />
                </div>
            </DialogTrigger>
            <DialogContent className='max-w-[256px_!important]'>
                <DialogHeader>
                    <DialogTitle>Create Page</DialogTitle>
                    <DialogDescription>
                        Give the new page a name. The name cannot be changed after creation.
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

export default CreatePageDialog;