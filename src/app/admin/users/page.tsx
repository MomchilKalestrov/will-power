'use client';
import React from 'react';
import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { Trash2 } from 'lucide-react';
import { getAllUsers, updateUser } from '@/lib/db/actions/';
import { cn, hasAuthority, validName, validPassword } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type sortFunction = Parameters<User[][ 'sort' ]>[ 0 ];

const roles: Record<User[ 'role' ], string> = {
    'owner': 'text-yellow-950 bg-amber-300 dark:text-yellow-200 dark:bg-yellow-900',
    'admin': 'text-red-950 bg-red-300 dark:text-red-200 dark:bg-red-900',
    'editor': 'text-lime-950 bg-lime-300 dark:text-lime-200 dark:bg-lime-900'
};

const Id: React.FC<{ id: string }> = ({ id }) => (
    <span
        className='text-xs py-1 px-2 rounded-sm hover:bg-stone-500/10'
        onClick={ () => window.navigator.clipboard.writeText(id) }
    >{ id.substring(0, 8) }...</span>
);

const Role: React.FC<{ role: User[ 'role' ] }> = ({ role }) => (
    <span className={ cn('text-xs py-1 px-2 font-bold rounded-sm', roles[ role ]) }>{ role }</span>
);

const UsersList: React.FC<{
    users: User[];
    onUserSelect: (user: User) => void;
}> = ({ users, onUserSelect }) => {
    const { status, data } = useSession();
    const [ searchBy, setSearchBy ] = React.useState<string>('');
    const sorters = React.useMemo<Record<string, sortFunction>>(() => ({
        'username': (a, b) => a.username.localeCompare(b.username),
        'role': (a, b) => hasAuthority(a.role, b.role) ? 1 : -1
    }), []);
    const [ sorter, setSorter ] = React.useState<string>(() => Object.keys(sorters)[ 0 ]);
    const filteredUsers = React.useMemo(() =>
        users
            .filter(({ username }) =>
                username
                    .toLowerCase()
                    .includes(searchBy.toLowerCase())
            )
            .sort(sorters[ sorter ])
    , [ sorter, users, searchBy ]);

    return (
        <>
            <div className='flex gap-2 sticky top-0 bg-background z-10 pb-2'>
                <Input
                    value={ searchBy }
                    onChange={ ({ target: { value } }) => setSearchBy(value) }
                    className='flex-1'
                    placeholder='Search by name...'
                />
                <Select onValueChange={ setSorter } value={ sorter }>
                    <SelectTrigger className='w-32'>
                        <SelectValue placeholder='Sort by...' />
                    </SelectTrigger>
                    <SelectContent>
                        { Object.keys(sorters).map((sorter) => (
                            <SelectItem
                                key={ sorter }
                                value={ sorter }
                            >{ sorter }</SelectItem>
                        )) }
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader className='bg-muted/50'>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead className='w-full'>Username</TableHead>
                        <TableHead>Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filteredUsers.map((user) => (
                            <TableRow
                                key={ user.id }
                                onClick={
                                    data?.user && user.username !== data.user.name
                                    ?   () => onUserSelect(user)
                                    :   undefined
                                }
                            >
                                <TableCell><Id id={ user.id } /></TableCell>
                                <TableCell>
                                    { user.username }
                                    { user.username === data?.user?.name && ' (You)' }
                                </TableCell>
                                <TableCell><Role role={ user.role } /></TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </>
    );
};

const UserPanel: React.FC<{
    user?: User | undefined,
    onChange: (user: User & { password: string }) => void
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
            <Label className={ canEdit ? 'opacity-50' : undefined } htmlFor='input-username'>Username</Label>
            <Input
                name='input-username'
                value={ userState?.username ?? '' }
                disabled={ canEdit }
                className={ cn(
                    'mb-2',
                    userState &&
                    !validName(userState.username) &&
                    'border-red-800'
                ) }
                onChange={ ({ target: { value } }) => {
                    const username =
                        value
                            .replace(/\s+/g, '_')
                            .replace(/[^A-Za-z0-9_]/g, '');
                    setUserState({ ...userState!, username })
                } }
            />
            <Label className={ canEdit ? 'opacity-50' : undefined } htmlFor='input-username'>Password</Label>
            <Input
                name='input-username'
                value={ userState?.password ?? '' }
                disabled={ canEdit }
                className={ cn(
                    'mb-2',
                    userState && userState?.password !== '' &&
                    !validPassword(userState.password) &&
                    'border-red-800'
                ) }
                onChange={ ({ target: { value: password } }) =>
                    setUserState({ ...userState!, password })
                }
            />
            <Label className={ canEdit ? 'opacity-50' : undefined } htmlFor='input-role'>Role</Label>
            <Select
                value={ userState?.role }
                disabled={ canEdit }
                onValueChange={ role => {
                    if (!hasAuthority((data?.user as any).role, role as User[ 'role' ]))
                        return;
                    setUserState({ ...userState!, role: role as User[ 'role' ] });
                } }
            >
                <SelectTrigger value={ userState?.role } className='w-full mb-2 capitalize'>
                    <SelectValue placeholder='Role' />
                </SelectTrigger>
                <SelectContent>
                    {
                        [ 'editor', 'admin', 'owner' ]
                            .map(role => (
                                <SelectItem
                                    key={ role }
                                    value={ role }
                                    className='capitalize'
                                >{ role }</SelectItem>
                            ))
                    }
                </SelectContent>
            </Select>
            <div className='flex gap-2'>
                <Button
                    size='icon'
                    variant='destructive'
                    disabled={ canEdit }
                ><Trash2 /></Button>
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

const Page: NextPage = () => {
    const [ users, setUsers ] = React.useState<User[] | undefined>();
    const [ selectedIndex, setSelectedIndex ] = React.useState<number | undefined>();

    React.useEffect(() => {
        getAllUsers().then(setUsers);
    }, []);

    const onUserUpdate = React.useCallback(async (user: User & { password: string }) => {
        const result = await updateUser(user);

        if (!result)
            return toast('Failed updating user.');
        toast('Updated user successfully.');
        
        setUsers((state) => {
            if (!state || selectedIndex === undefined ) return;
            let newState = [ ...state ];
            newState[ selectedIndex ] = {
                id: user.id,
                username: user.username,
                role: user.role
            };
            return newState;
        });
    }, [ users, selectedIndex ]);

    if (!users)
        return (<></>);

    return (
        <ResizablePanelGroup direction='horizontal' className='p-8'>
            <ResizablePanel className='pr-4'>
                <UsersList
                    users={ users }
                    onUserSelect={ ({ username }) =>
                        setSelectedIndex(users.findIndex((u) => username === u.username))
                    }
                /> 
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className='pl-4 min-w-64 max-w-128'>
                <UserPanel
                    user={
                        selectedIndex !== undefined
                        ?   users[ selectedIndex ]
                        :   undefined
                    }
                    onChange={ onUserUpdate }
                />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default Page;