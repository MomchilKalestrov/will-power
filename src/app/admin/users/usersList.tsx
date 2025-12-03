'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { cn, hasAuthority } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AddUserDialog from './addUserDialog';

// Types
export type SortFunction = Parameters<User[][ 'sort' ]>[ 0 ];

const roles: Record<User[ 'role' ], string> = {
    owner: 'text-yellow-950 bg-amber-300 dark:text-yellow-200 dark:bg-yellow-900',
    admin: 'text-red-950 bg-red-300 dark:text-red-200 dark:bg-red-900',
    editor: 'text-lime-950 bg-lime-300 dark:text-lime-200 dark:bg-lime-900',
};

const Id: React.FC<{ id: string }> = ({ id }) => (
    <span
        className='text-xs py-1 px-2 rounded-sm hover:bg-stone-500/10'
        onClick={ () => window.navigator.clipboard.writeText(id) }
    >
        { id.substring(0, 8) }...
    </span>
);

const Role: React.FC<{ role: User['role'] }> = ({ role }) => (
    <span className={ cn('text-xs py-1 px-2 font-bold rounded-sm', roles[ role ]) }>{ role }</span>
);

const UsersList: React.FC<{
    users: User[];
    onUserSelect: (user: User) => void;
    onUserAdd: (user: Omit<User, 'id'> & { password: string }) => void;
}> = ({ users, onUserSelect, onUserAdd }) => {
    const { data } = useSession();
    const [ searchBy, setSearchBy ] = React.useState<string>('');
    const sorters = React.useMemo<Record<string, SortFunction>>(
        () => ({
            username: (a, b) => a.username.localeCompare(b.username),
            role: (a, b) => (hasAuthority(a.role, b.role) ? -1 : 1),
        }),
        []
    );
    const [ sorter, setSorter ] = React.useState<string>(() => Object.keys(sorters)[ 0 ]);
    const filteredUsers = React.useMemo(
        () =>
            users
                .filter(({ username }) => username.toLowerCase().includes(searchBy.toLowerCase()))
                .sort(sorters[ sorter ]),
        [ sorter, users, searchBy, sorters ]
    );

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
                        { Object.keys(sorters).map((s) => (
                            <SelectItem key={ s } value={ s }>
                                { s }
                            </SelectItem>
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
                    { filteredUsers.map((user) => (
                        <TableRow
                            key={ user.id }
                            onClick={
                                data?.user && user.username !== data.user.name
                                    ? () => onUserSelect(user)
                                    : undefined
                            }
                        >
                            <TableCell>
                                <Id id={ user.id } />
                            </TableCell>
                            <TableCell>
                                { user.username }
                                { user.username === data?.user?.name && ' (You)' }
                            </TableCell>
                            <TableCell>
                                <Role role={ user.role } />
                            </TableCell>
                        </TableRow>
                    )) }
                </TableBody>
                {

                    (data?.user as any)?.role === 'owner' &&
                    <TableFooter>
                        <TableRow>
                            <TableCell>
                                <AddUserDialog onUserAdd={ onUserAdd } />
                            </TableCell>
                            <TableCell />
                            <TableCell />
                        </TableRow>
                    </TableFooter>
                }
            </Table>
        </>
    );
};

export default UsersList;
