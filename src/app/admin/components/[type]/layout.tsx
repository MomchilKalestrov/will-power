'use client';
import React from 'react';
import Link from 'next/link';
import { NextPage } from 'next';
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
import { notFound, useParams } from 'next/navigation';

const pages: string[] = [ 'header', 'page', 'footer', 'component' ];

const Layout: NextPage<{
    children: React.JSX.Element
}> = ({
    children
}) => {
    const { type } = useParams();
    if (type && !pages.includes(type as string)) notFound();

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
                                        <SidebarMenuButton asChild isActive={ type === page }>
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