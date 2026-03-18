'use client';
import React from 'react';
import { toast } from 'sonner';
import { NextPage } from 'next';
import { ServerCrash } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Spinner } from '@/components/ui/spinner';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import Portal from '@/components/portal';

import { getAllUsers, updateUser, deleteUser, createUser } from '@/lib/db/actions/user';

import UsersList from './usersList';
import UserPanel from './userPanel';
import AddUserDialog from './addUserDialog';

const Page: NextPage = () => {
    const t = useTranslations('Admin.Users');
    const [ users, setUsers ] = React.useState<User[] | null | undefined>();
    const [ selectedIndex, setSelectedIndex ] = React.useState<number | undefined>();

    React.useEffect(() =>
        void getAllUsers()
            .then(response => {
                if (!response.success) {
                    setUsers(null);
                    return toast(t('failedGet', { reason: response.reason }));
                };
                return setUsers(response.value);
            }),
        [t]
    );

    const onUserUpdate = React.useCallback(async (user: User & { password?: string; }) => {
        const response = await updateUser(user);

        if (!response.success)
            return toast(t('failedUpdate', { reason: response.reason }));
        toast(t('updated'));
        
        setUsers((state) => {            
            const newState = [ ...state! ];
            newState[ selectedIndex! ] = {
                id: user.id,
                username: user.username,
                role: user.role
            };
            
            return newState;
        });
    }, [ selectedIndex, t ]);

    const onUserDelete = React.useCallback(async () => {
        const response = await deleteUser(users![ selectedIndex! ].id);

        if (!response.success)
            return toast(t('failedDelete', { reason: response.reason }));
        toast(t('deleted'));

        setUsers(state => {            
            const newState = [ ...state! ];
            newState.splice(selectedIndex!, 1);

            return newState;
        })
    }, [ users, selectedIndex, t ]);

    const onUserAdd = React.useCallback(async (user: Omit<User, 'id'> & { password: string }) => {
        const response = await createUser(user);

        if (!response.success)
            return toast(t('failedCreate', { reason: response.reason }));
        toast(t('created'));
        
        setUsers(state => {
            const newState = [ ...state! ];
            newState.push({
                ...user,
                password: undefined,
                id: response.value
            } as User);

            return newState;
        });
    }, [ t ]);

    if (users === null)
        return (
            <div className='w-full h-full flex justify-center items-center flex-col opacity-30'>
                <ServerCrash className='size-27' />
                <p className='text-xl'>{ t('failedGetGeneral') }</p>
            </div>
        );

    if (users === undefined)
        return (
            <div className='h-[calc(100dvh-var(--spacing)*16)] flex justify-center items-center'>
                <Spinner />
            </div>
        );

    return (
        <ResizablePanelGroup className='p-8'>
            <ResizablePanel className='pr-4'>
                <UsersList
                    users={ users }
                    onUserSelect={ ({ username }) => {
                        const newIndex = users.findIndex((u) => username === u.username);
                        if (newIndex !== -1) setSelectedIndex(newIndex);
                    } }
                    onUserAdd={ onUserAdd }
                />
                <Portal parent='add-user-portal'>
                    <AddUserDialog onUserAdd={ onUserAdd } />
                </Portal>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className='pl-4 min-w-64 max-w-lg'>
                <UserPanel
                    user={
                        selectedIndex !== undefined
                        ?   users[ selectedIndex ]
                        :   undefined
                    }
                    onChange={ onUserUpdate }
                    onDelete={ onUserDelete }
                />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default Page;