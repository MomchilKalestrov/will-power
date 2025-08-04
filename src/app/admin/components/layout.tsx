import React from 'react';
import Link from 'next/link';
import { NextPage } from 'next';
import { headers } from 'next/headers';
import SettingsPopover from '@/components/settingsPopover';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton, 
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail
} from '@/components/ui/sidebar';

const pages: string[] = [
    'headers',
    'pages',
    'footers',
    'components'
];

const Layout: NextPage<{
    children: React.JSX.Element
}> = async ({
    children
}) => {
    const currentPage = (await headers()).get('x-current-path')!.split('/')[ 3 ].split('?')[ 0 ];

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className='flex flex-row items-center gap-2'>
                    <SettingsPopover />
                    <p className='font-bold text-xl grow text-center'>Will-Power</p>
                    <span className='size-9' />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                { pages.map((page) => (
                                    <SidebarMenuItem key={ page }>
                                        <SidebarMenuButton asChild isActive={ currentPage === page }>
                                            <Link className='capitalize' href={ '/admin/components/' + page }>
                                                { page }
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )) }
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
            </Sidebar>
            <main className='p-4 grow'>{ children }</main>
        </SidebarProvider>
    );
};

export default Layout;