'use client';
import React from 'react';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

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

import { createComponent } from '@/lib/db/actions/component';

type Props = {
    components: string[];
    type: componentType;
};

const CreateComponentDialog: React.FC<Props> = ({
    components,
    type
}) => {
    const router = useRouter();
    const t = useTranslations('Admin.Components');
    const [ name, setName ] = React.useState<string>('');
    const [ mounted, setMounted ] = React.useState<boolean>(false);

    const onPageCreated = React.useCallback(async () => {
        const response = await createComponent(name, type);
        if(!response.success)
            return toast(t('failedCreate', { type, reason: response.reason }));
        router.push('/admin/editor/' + name);
    }, [ name, type, t ]);

    React.useEffect(() => void setMounted(true), []);

    const validInput =
        name === encodeURIComponent(name) &&
        name.length !== 0 &&
        !components.includes(name) &&
        !(name === 'admin' && type === 'page');

    if (!mounted) return (<></>);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline' size='icon'>
                    <PlusCircle />
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-[256px_!important]'>
                <DialogHeader>
                    <DialogTitle>{ t('createNew', { type }) }</DialogTitle>
                    <DialogDescription>
                        { t('giveName', { type }) }
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-2 grid-cols-[auto_1fr]'>
                    <Input
                        className='col-span-full'
                        id='input-new-page-name'
                        placeholder={ t('namePlaceholder') }
                        value={ name }
                        onChange={ ({ target: { value } }) => setName(value.toLowerCase()) }
                    />
                    {
                        !validInput &&
                        <p className='col-span-full text-xs font-medium text-red-900'>{ t('invalidName') }</p>
                    }
                    <DialogClose asChild>
                        <Button variant='outline'>{ t('closeButton') }</Button>
                    </DialogClose>
                    <Button disabled={ !validInput } onClick={ onPageCreated }>
                        { t('createButton') }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateComponentDialog;