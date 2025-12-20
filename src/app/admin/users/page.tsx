'use client';
import React from 'react';
import { toast } from 'sonner';
import { NextPage } from 'next';
import ReactDOM from 'react-dom';
import { ServerCrash } from 'lucide-react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import { getAllUsers, updateUser, deleteUser, createUser } from '@/lib/db/actions';

import UsersList from './usersList';
import UserPanel from './userPanel';
import AddUserDialog from './addUserDialog';

const Page: NextPage = () => {
    const [ users, setUsers ] = React.useState<User[] | null | undefined>();
    const [ selectedIndex, setSelectedIndex ] = React.useState<number | undefined>();

    React.useEffect(() => {
        getAllUsers()
            .then(response => {
                if (!response.success) {
                    setUsers(null);
                    return toast('Failed to get users: ' + response.reason);
                };
                return setUsers(response.value);
            });
    }, []);

    const onUserUpdate = React.useCallback(async (user: User & { password?: string; }) => {
        const response = await updateUser(user);

        if (!response.success)
            return toast('Failed to update the user: ' + response.reason);
        toast('Updated the user.');
        
        setUsers((state) => {            
            const newState = [ ...state! ];
            newState[ selectedIndex! ] = {
                id: user.id,
                username: user.username,
                role: user.role
            };
            
            return newState;
        });
    }, [ selectedIndex ]);

    const onUserDelete = React.useCallback(async () => {
        const response = await deleteUser(users![ selectedIndex! ].id);

        if (!response.success)
            return toast('Failed to delete the user: ' + response.reason);
        toast('Deleted the user.');

        setUsers(state => {            
            const newState = [ ...state! ];
            newState.splice(selectedIndex!, 1);

            return newState;
        })
    }, [ users, selectedIndex ]);

    const onUserAdd = React.useCallback(async (user: Omit<User, 'id'> & { password: string }) => {
        const response = await createUser(user);

        if (!response.success)
            return toast('Failed to create a new user: ' + response.reason);
        toast('Created a new user.');
        
        setUsers(state => {
            const newState = [ ...state! ];
            newState.push({
                ...user,
                password: undefined,
                id: response.value
            } as User);

            return newState;
        });
    }, []);

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
                    onUserAdd={ onUserAdd }
                />
                { /* Show the Dialog in the header instead */ }
                { ReactDOM.createPortal(
                    <AddUserDialog onUserAdd={ onUserAdd } />,
                    document.getElementById('add-user-portal')!
                ) }
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