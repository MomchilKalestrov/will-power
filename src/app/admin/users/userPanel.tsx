'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { cn, hasAuthority, validName, validPassword } from '@/lib/utils';

const UserPanel: React.FC<{
    user?: User | undefined;
    onChange: (user: User & { password: string }) => void;
}> = ({ user, onChange }) => {
    const { status, data } = useSession();
    const [ userState, setUserState ] = React.useState<User & { password: string } | undefined>();

    React.useEffect(() => {
        setUserState(user ? { ...user, password: '' } : undefined);
    }, [ user ]);

    let canEdit = !user || status !== 'authenticated';
    if (status === 'authenticated' && user)
        canEdit = canEdit || !hasAuthority((data.user as any).role, user.role);

    return (
        <div className='flex flex-col gap-2'>
            <Label className={ canEdit ? 'opacity-50' : undefined } htmlFor='input-username'>
                Username
            </Label>
            <Input
                name='input-username'
                value={ userState?.username ?? '' }
                disabled={ canEdit }
                className={ cn('mb-2', userState && !validName(userState.username) && 'border-red-800') }
                onChange={ ({ target: { value } }) => {
                    const username = value.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '');
                    setUserState({ ...userState!, username });
                } }
            />
            <Label className={ canEdit ? 'opacity-50' : undefined } htmlFor='input-username'>
                Password
            </Label>
            <Input
                name='input-username'
                value={ userState?.password ?? '' }
                disabled={ canEdit }
                className={ cn(
                    'mb-2',
                    userState && userState?.password !== '' && !validPassword(userState.password) && 'border-red-800'
                ) }
                onChange={ ({ target: { value: password } }) => setUserState({ ...userState!, password }) }
            />
            <Label className={ canEdit ? 'opacity-50' : undefined } htmlFor='input-role'>
                Role
            </Label>
            <Select
                value={ userState?.role }
                disabled={ canEdit }
                onValueChange={ (role) => {
                    if (!hasAuthority((data?.user as any).role, role as User['role'])) return;
                    setUserState({ ...userState!, role: role as User['role'] });
                } }
            >
            <SelectTrigger value={ userState?.role } className='w-full mb-2 capitalize'>
                <SelectValue placeholder='Role' />
            </SelectTrigger>
            <SelectContent>
                { ['editor', 'admin', 'owner'].map((role) => (
                    <SelectItem key={ role } value={ role } className='capitalize'>
                        { role }
                    </SelectItem>
                )) }
            </SelectContent>
            </Select>
            <div className='flex gap-2'>
                <Button size='icon' variant='destructive' disabled={canEdit}>
                    <Trash2 />
                </Button>
                <Button
                    variant='outline'
                    className='flex-1'
                    disabled={ canEdit }
                    onClick={ () => onChange(userState!) }
                >Update</Button>
            </div>
        </div>
    );
};

export default UserPanel;
