'use client';
import React from 'react';
import Link from 'next/link';
import { NextPage } from 'next';
import { usePathname } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton, 
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarProvider,
    SidebarRail
} from '@/components/ui/sidebar';
import { cookies } from '@/lib/utils';
import { ConfigProvider } from '@/components/configProvider';
import { SessionProvider } from 'next-auth/react';
import { ChevronRight } from 'lucide-react';

type name = string;
type path = string;

const pages: Record<name, Record<name, path> | path> = {
    'Components': {
        'Headers': '/admin/components/header',
        'Pages': '/admin/components/page',
        'Footer': '/admin/components/footer',
        'Components': '/admin/components/component'
    },
    'Config': '/admin/config'
};

const Layout: NextPage<{
    children: React.JSX.Element
}> = ({
    children
}) => {
    const currentPath = usePathname().split('?')[ 0 ];

    React.useEffect(() => {
        if (
            !window.location.href.includes('/admin/viewer/') &&
            cookies.get('darkMode') === 'true'
        ) document.body.classList.add('dark')
    }, []);

    if (currentPath.includes('/admin/viewer') || currentPath.includes('/admin/editor'))
        return children;

    return (
        <ConfigProvider>
            <SessionProvider>
                <SidebarProvider>
                    <Sidebar className='dark:bg-accent'>
                        <SidebarHeader className='flex flex-row items-center gap-2'>
                            <p className='font-bold text-xl grow text-center'>Will-Power</p>
                        </SidebarHeader>
                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        { Object.entries(pages).map(([ key, value ]) =>
                                            typeof value === 'object'
                                            ?   (
                                                    <SidebarMenuItem key={ key }>
                                                        <Collapsible>
                                                            <CollapsibleTrigger asChild>
                                                                <SidebarMenuButton className='flex justify-between'>
                                                                    { key }
                                                                    <ChevronRight />
                                                                </SidebarMenuButton>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent>
                                                                <SidebarMenuSub>
                                                                    { Object.entries(value).map(([ key, value ]) => (
                                                                        <SidebarMenuButton isActive={ value === currentPath } key={ key }>
                                                                            <Link href={ value }>{ key }</Link>
                                                                        </SidebarMenuButton>
                                                                    )) }
                                                                </SidebarMenuSub>
                                                            </CollapsibleContent>
                                                        </Collapsible>
                                                    </SidebarMenuItem>
                                                )
                                            : (
                                                <SidebarMenuButton isActive={ value === currentPath } key={ key }>
                                                    <Link href={ value }>{ key }</Link>
                                                </SidebarMenuButton>
                                            )
                                        ) }
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                        <SidebarRail />
                    </Sidebar>
                    <SidebarInset>
                        { children }
                    </SidebarInset>
                </SidebarProvider>
            </SessionProvider>
        </ConfigProvider>
    );
};

export default Layout;