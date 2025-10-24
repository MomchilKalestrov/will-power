'use client';
import React from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import * as actions from '@/lib/db/actions';
import z from 'zod';
import { validName, validPassword } from '@/lib/utils';

const AddUserDialog: React.FC<{ onUserAdd: (user: User) => void }> = ({ onUserAdd }) => {
    const [ dialogOpen, setDialogOpen ] = React.useState<boolean>(false);
    const [ user, setUser ] = React.useState<Omit<User, 'id'> & { password: string }>({
        username: 'newuser',
        password: 'password',
        role: 'editor'
    });
    const { data } = useSession();

    if ((data?.user as any)?.role !== 'owner')
        return (<></>);

    return (
        <Dialog open={ dialogOpen } onOpenChange={ setDialogOpen }>
            <DialogTrigger asChild>
                <Button variant='outline' size='icon'>
                    <PlusCircle />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add User</DialogTitle>
                    <DialogDescription>
                        Editors are only allowed to create and edit components.<br />
                        Admins are allowed to also manage plugins, themes and editors.<br />
                        Owners have complete access to the whole project.
                    </DialogDescription>
                </DialogHeader>
                <div className='grid grid-cols-[min-content_1fr] gap-2'>
                    <Label htmlFor='username'>Username:</Label>
                    <Input
                        name='username'
                        value={ user.username }
                        onChange={ ({ target: { value } }) => setUser({ ...user, username: value }) }
                    />
                    <Label htmlFor='password'>Password:</Label>
                    <Input
                        name='password'
                        type='password'
                        value={ user.password }
                        onChange={ ({ target: { value } }) => setUser({ ...user, password: value }) }
                    />
                    <Label htmlFor='role'>Role:</Label>
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
                    onClick={ async () => {
                        const result = await actions.createUser(user);
                    
                        setDialogOpen(false);

                        if (!result)
                            return toast('Failed to create new user.');

                        onUserAdd({
                            id: result,
                            username: user.username,
                            role: user.role
                        });
                    } }
                >Add</Button>
            </DialogContent>
        </Dialog>
    );
};

export default AddUserDialog;