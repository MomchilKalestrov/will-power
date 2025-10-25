'use client';
import React from 'react';
import Link from 'next/link';
import { NextComponentType, NextPageContext } from 'next';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

import { Switch } from '@/components/ui/switch';
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
import { Label } from '@/components/ui/label';

import { ConfigProvider } from '@/components/configProvider';
import { ThemesProvider } from '@/components/themesProvider';

import { cookies } from '@/lib/utils';

type name = string;
type path = string;

const pages: Record<name, Record<name, path> | path> = {
    'Home': '/admin/home',
    'Components': {
        'Headers': '/admin/components/header',
        'Pages': '/admin/components/page',
        'Footer': '/admin/components/footer',
        'Components': '/admin/components/component'
    },
    'Config': '/admin/config',
    'Users': '/admin/users',
    'Plugins': '/admin/plugins',
    'Themes': '/admin/themes'
};

const hideNavInRoutes: string[] = [
    '/admin/auth/login',
    '/admin/viewer',
    '/admin/editor',
    '/admin/logout'
];

const Layout: NextComponentType<NextPageContext, {}, LayoutProps<'/admin'>> = ({
    children
}) => {
    const currentPath = usePathname().split('?')[ 0 ];

    const [ darkMode, setDarkMode ] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const isDark = cookies.get('darkMode') === 'true';
        if (!window.location.href.includes('/admin/viewer/') && isDark)
            document.body.classList.add('dark');
        setDarkMode(isDark);
    }, []);

    if (hideNavInRoutes.some(v => currentPath.startsWith(v)))
        return (
            <ConfigProvider>
                <SessionProvider>
                    { children }
                </SessionProvider>
            </ConfigProvider>
        );

    return (
        <ThemesProvider>
            <ConfigProvider>
                <SessionProvider>
                    <SidebarProvider>
                        <Sidebar className='dark:bg-accent'>
                            <SidebarHeader className='flex flex-row items-center gap-2'>
                                <p className='font-bold text-xl grow text-center'>Will-Power</p>
                            </SidebarHeader>
                            <SidebarContent className='grid grid-rows-[1fr_auto]'>
                                <SidebarGroup>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            { Object.entries(pages).map(([ key, value ]) =>
                                                typeof value === 'object'
                                                ?   (
                                                        <SidebarMenuItem key={ key }>
                                                            <Collapsible className='group/collapsible' defaultOpen={ true }>
                                                                <CollapsibleTrigger asChild>
                                                                    <SidebarMenuButton className='flex justify-between'>
                                                                        { key }
                                                                        <ChevronRight className='group-data-[state=open]:rotate-90' />
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
                                    <div className='flex gap-2 p-4'>
                                        <Switch
                                            checked={ darkMode }
                                            name='dark-mode-toggle'
                                            onClick={ () => {
                                                const newMode = !darkMode;
                                                setDarkMode(newMode);
                                                if (newMode) {
                                                    cookies.set('darkMode', 'true');
                                                    document.body.classList.add('dark');
                                                } else {
                                                    cookies.set('darkMode', 'false');
                                                    document.body.classList.remove('dark');
                                                }
                                            } }
                                        />
                                        <Label htmlFor='dark-mode-toggle'>
                                            { darkMode ? 'Dark Mode' : 'Light Mode' }
                                        </Label>
                                    </div>
                            </SidebarContent>
                            <SidebarRail />
                        </Sidebar>
                        <SidebarInset>
                            { children }
                        </SidebarInset>
                    </SidebarProvider>
                </SessionProvider>
            </ConfigProvider>
        </ThemesProvider>
    );
};

export default Layout;