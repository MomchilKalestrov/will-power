'use client';
import React from 'react';
import { toast } from 'sonner';
import { CirclePlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useThemes } from '@/contexts/themes';

const AddThemeDialog: React.FC = () => {
    const t = useTranslations('Admin.Themes');
    const { addTheme } = useThemes();
    const [ file, setFile ] = React.useState<File | undefined>();
    const [ dialogOpen, setDialogOpen ] = React.useState<boolean>(false);

    const onSend = React.useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (event.currentTarget)
            event.currentTarget.disabled = true;

        const response = await addTheme(file!);
        toast(response);

        if (event.currentTarget)
            event.currentTarget.disabled = false;
        setDialogOpen(false);
    }, [ file ]);

    return (
        <Dialog open={ dialogOpen } onOpenChange={ setDialogOpen }>
            <DialogTrigger asChild>
                <Button variant='outline' size='icon'>
                    <CirclePlus />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{ t('upload') }</DialogTitle>
                    <DialogDescription>
                        { t.rich('uploadDesc', { code: chunks => <code>{ chunks }</code> }) }
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
                >{ t('uploadBtn') }</Button>
            </DialogContent>
        </Dialog>
    );
};

export default AddThemeDialog;