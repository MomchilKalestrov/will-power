'use client';
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
    Dialog,
    DialogTitle,
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Select,
    SelectItem,
    SelectValue,
    SelectContent,
    SelectTrigger
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { validName, validPassword } from '@/lib/utils';

type Props = {
    onUserAdd: (user: Omit<User, 'id'> & { password: string }) => void;
};

const AddUserDialog: React.FC<Props> = ({ onUserAdd }) => {
    const t = useTranslations('Admin.Users');
    const [ dialogOpen, setDialogOpen ] = React.useState<boolean>(false);
    const [ user, setUser ] = React.useState<Omit<User, 'id'> & { password: string }>({
        username: 'newuser',
        password: 'password',
        role: 'editor'
    });

    return (
        <Dialog open={ dialogOpen } onOpenChange={ setDialogOpen }>
            <DialogTrigger asChild>
                <Button variant='outline' size='icon'>
                    <PlusCircle />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{ t('addUser') }</DialogTitle>
                    <DialogDescription>
                        {t.rich('editorsDesc', { br: () => <br /> })}
                    </DialogDescription>
                </DialogHeader>
                <div className='grid grid-cols-[min-content_1fr] gap-2'>
                    <Label htmlFor='username'>{ t('username') }</Label>
                    <Input
                        name='username'
                        value={ user.username }
                        onChange={ ({ target: { value } }) => setUser({ ...user, username: value }) }
                    />
                    <Label htmlFor='password'>{ t('password') }</Label>
                    <Input
                        name='password'
                        type='password'
                        value={ user.password }
                        onChange={ ({ target: { value } }) => setUser({ ...user, password: value }) }
                    />
                    <Label htmlFor='role'>{ t('role') }</Label>
                    <Select value={ user.role } onValueChange={ value => setUser({ ...user, role: value as User[ 'role' ] }) }>
                        <SelectTrigger className='w-full'>
                            <SelectValue></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            { [ 'editor', 'admin', 'owner' ].map(role => (
                                <SelectItem value={ role } key={ role }>{ role }</SelectItem>
                            )) }
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    disabled={ !validName(user.username) || !validPassword(user.password) }
                    onClick={ () => onUserAdd(user) }
                >{ t('add') }</Button>
            </DialogContent>
        </Dialog>
    );
};

export default AddUserDialog;