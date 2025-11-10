'use client';
import React from 'react';
import { toast } from 'sonner';
import { Metadata, NextPage } from 'next';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import * as actions from '@/lib/db/actions';

import UsersList from './usersList';
import UserPanel from './userPanel';

export const metadata: Metadata = {
    title: 'Users'
};

const Page: NextPage = () => {
    const [ users, setUsers ] = React.useState<User[] | undefined>();
    const [ selectedIndex, setSelectedIndex ] = React.useState<number | undefined>();

    React.useEffect(() => {
        actions.getAllUsers().then(setUsers);
    }, []);

    const onUserUpdate = React.useCallback(async (user: User & { password: string }) => {
        const result = await actions.updateUser(user);

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