'use client';
import React from 'react';
import { toast } from 'sonner';
import { NextPage } from 'next';
import { ServerCrash } from 'lucide-react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import { getAllUsers, updateUser } from '@/lib/db/actions';

import UsersList from './usersList';
import UserPanel from './userPanel';

const Page: NextPage = () => {
    const [ users, setUsers ] = React.useState<User[] | null | undefined>();
    const [ selectedIndex, setSelectedIndex ] = React.useState<number | undefined>();

    React.useEffect(() => {
        getAllUsers()
            .then(response => {
                if (!response.success)
                    return toast(response.reason);
                return setUsers(response.value);
            });
    }, []);

    const onUserUpdate = React.useCallback(async (user: User & { password?: string; }) => {
        const result = await updateUser(user);

        if (!result.success)
            return toast('Failed updating user.');
        toast('Updated user successfully.');
        
        setUsers((state) => {
            if (!state || selectedIndex === undefined ) return;
            const newState = [ ...state ];
            newState[ selectedIndex ] = {
                id: user.id,
                username: user.username,
                role: user.role
            };
            return newState;
        });
    }, [ users, selectedIndex ]);

    if (users === null)
        return (
            <div className='w-full h-full flex justify-center items-center flex-col opacity-30'>
                <ServerCrash className='size-27' />
                <p className='text-xl'>Failed to get users...</p>
            </div>
        );

    if (!users)
        return (<></>);

    return (
        <ResizablePanelGroup direction='horizontal' className='p-8'>
            <ResizablePanel className='pr-4'>
                <UsersList
                    users={ users }
                    onUserSelect={ ({ username }) => {
                        const newIndex = users.findIndex((u) => username === u.username);
                        if (newIndex !== -1) setSelectedIndex(newIndex);
                    } }
                    onUserAdd={ async (newUser) => {
                    } }
                /> 
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
                />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default Page;