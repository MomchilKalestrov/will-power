'use client';
import React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
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

import { usePlugins } from '@/components/pluginsProvider';
import { ThemesProvider } from '@/components/themesProvider';
import { FileSelectorProvider, useFileSelector } from '@/components/fileSelector';

import { cookies } from '@/lib/utils';

const pages: Record<string, Record<string, string> | string> = {
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
    '/admin/logout'
];

const FilesButton: React.FC = () => {
    const { selectFile } = useFileSelector();

    const onClick = React.useCallback(() => selectFile('none').catch(() => null), []);

    return (
        <SidebarMenuButton onClick={ onClick  } isActive={ false }>
            Files
        </SidebarMenuButton>
    )
};

const Layout: NextComponentType<NextPageContext, unknown, LayoutProps<'/admin'>> = ({
    children
}) => {
    const [ pathname, stringParams ] = usePathname().split('?');
    const { plugins } = usePlugins();
    const [ darkMode, setDarkMode ] = React.useState<boolean>(false);
    const urlParams = React.useMemo(() => new URLSearchParams(stringParams), [ stringParams ]);
    const pluginPages = React.useMemo<[ string, string ][]>(() =>
        [ ...plugins.values() ]
            .filter(({ enabled }) => enabled)
            .map(({ pages }) => pages)
            .flat()
            .filter(Boolean)
            .map<[ string, string ]>(({ name }: any) => [
                name,
                `/admin/plugin/${ encodeURI(name) }`
            ] as [ string, string ])
    , [ plugins ]);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const isDark = cookies.get('darkMode') === 'true';
        if (!pathname.includes('/admin/viewer/') && isDark)
            document.body.classList.add('dark');
        else
            document.body.classList.remove('dark');
        setDarkMode(isDark);
    }, [ pathname ]);

    if (hideNavInRoutes.some(v => pathname.startsWith(v)) || urlParams.get('showSidebar') === 'false')
        return (
            <FileSelectorProvider>
                <SessionProvider>
                    { children }
                </SessionProvider>
            </FileSelectorProvider>
        );

    return (
        <FileSelectorProvider>
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
                                                            <Collapsible defaultOpen={ true }>
                                                                <CollapsibleTrigger asChild>
                                                                    <SidebarMenuButton className='flex justify-between'>
                                                                        { key }
                                                                        <ChevronDown />
                                                                    </SidebarMenuButton>
                                                                </CollapsibleTrigger>
                                                                <CollapsibleContent>
                                                                    <SidebarMenuSub>
                                                                        { Object.entries(value).map(([ key, value ]) => (
                                                                            <SidebarMenuButton isActive={ value === pathname } key={ key }>
                                                                                <Link href={ value }>{ key }</Link>
                                                                            </SidebarMenuButton>
                                                                        )) }
                                                                    </SidebarMenuSub>
                                                                </CollapsibleContent>
                                                            </Collapsible>
                                                        </SidebarMenuItem>
                                                    )
                                                : (
                                                    <SidebarMenuButton isActive={ value === pathname } key={ key }>
                                                        <Link href={ value }>{ key }</Link>
                                                    </SidebarMenuButton>
                                                )
                                            ) }
                                            <FilesButton />
                                            <SidebarMenuItem>
                                                <Collapsible defaultOpen={ true }>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton className='flex justify-between'>
                                                            Plugins Pages
                                                            <ChevronDown />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            { pluginPages.map(([ name, path ]) => (
                                                                <SidebarMenuButton className='capitalize' isActive={ path === pathname } key={ name }>
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
        </FileSelectorProvider>
    );
};

export default Layout;