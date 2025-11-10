'use client';
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { NextComponentType, NextPageContext } from 'next';

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

import { ThemesProvider } from '@/components/themesProvider';
import { usePlugins } from '@/components/pluginsProvider';

import { cookies } from '@/lib/utils';

import favicon from './admin.ico';

type name = string;
type path = string;

const pages: Record<name, Record<name, path> | path> = {
    'Home': '/admin/home',
    'Components': {
        'Headers': '/admin/components/header',
        'Pages': '/admin/components/page',
        'Footers': '/admin/components/footer',
        'Components': '/admin/components/component'
    },
    'Variables': '/admin/variables',
    'Users': '/admin/users',
    'Plugins': '/admin/plugins',
    'Themes': '/admin/themes'
};

const hideNavInRoutes: string[] = [
    '/admin/auth/login',
    '/admin/viewer',
    '/admin/editor',
    '/admin/logout',
    '/admin/plugin/'
];

const Layout: NextComponentType<NextPageContext, {}, LayoutProps<'/admin'>> = ({
    children
}) => {
    const currentPath = usePathname().split('?')[ 0 ];
    const { plugins } = usePlugins();
    const [ darkMode, setDarkMode ] = React.useState<boolean>(false);
    const pluginPages = React.useMemo<[ string, string ][]>(() =>
        [ ...plugins.values() ]
            .filter(({ enabled }) => enabled)
            .map(({ components }) => components)
            .flat()
            .filter(({ metadata }) => metadata.type === 'page')
            .map<[ string, string ]>(({ metadata }) => [
                metadata.name,
                `/admin/plugin/${ encodeURI(metadata.name) }`
            ] as [ string, string ])
    , [ plugins ]);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const isDark = cookies.get('darkMode') === 'true';
        if (
            !window.location.href.includes('/admin/viewer/') &&
            !window.location.href.includes('/admin/plugin/') &&
            isDark
        )
            document.body.classList.add('dark');
        else
            document.body.classList.remove('dark');
        setDarkMode(isDark);
    }, [ currentPath ]);

    if (hideNavInRoutes.some(v => currentPath.startsWith(v)))
        return (
            <SessionProvider>
                { children }
            </SessionProvider>
        );

    return (
        <ThemesProvider>
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
                                        <SidebarMenuItem>
                                            <Collapsible className='group/collapsible' defaultOpen={ true }>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton className='flex justify-between'>
                                                        Plugins Pages
                                                        <ChevronRight className='group-data-[state=open]:rotate-90' />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        { pluginPages.map(([ name, path ]) => (
                                                            <SidebarMenuButton className='capitalize' isActive={ path === currentPath } key={ name }>
                                                                <Link href={ path }>{ name.replace(/([A-Z])/g, ' $1') }</Link>
                                                            </SidebarMenuButton>
                                                        )) }
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </SidebarMenuItem>
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
        </ThemesProvider>
    );
};

export default Layout;