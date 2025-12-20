'use client';
import React from 'react';
import { toast } from 'sonner';
import ReactDOM from 'react-dom';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
    Dialog,
    DialogTitle,
    DialogClose,
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogDescription
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
    const [ mounted, setMounted ] = React.useState<boolean>(false);

    const onPageCreated = React.useCallback(async () => {
        const response = await createComponent(name, type);
        if(!response.success)
            return toast(`Failed to create the ${ type }: ` + response.reason);
        router.push('/admin/editor/' + name);
    }, [ name, type ]);

    React.useEffect(() =>
        void setMounted(true)
    , []);

    const validInput =
        name === encodeURIComponent(name) &&
        name.length !== 0 &&
        !components.includes(name) &&
        !(name === 'admin' && type === 'page');

    if (!mounted) return (<></>);

    return ReactDOM.createPortal(
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline' size='icon'>
                    <PlusCircle />
                </Button>
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
        </Dialog>,
        document.getElementById('components-portal')!
    )
};

export default CreateComponentDialog;