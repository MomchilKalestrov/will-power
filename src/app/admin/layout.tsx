'use client';
import React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { NextComponentType, NextPageContext } from 'next';
import { SessionProvider, useSession } from 'next-auth/react';

import {
    Sidebar,
    SidebarRail,
    SidebarMenu,
    SidebarInset,
    SidebarGroup,
    SidebarHeader,
    SidebarMenuSub,
    SidebarContent,
    SidebarProvider,
    SidebarMenuItem,
    SidebarMenuButton, 
    SidebarGroupContent
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { usePlugins } from '@/contexts/plugins';
import { ThemesProvider } from '@/contexts/themes';
import { DialogProvider } from '@/contexts/dialog';
import { FileSelectorProvider, useFileSelector } from '@/contexts/file';

import { cookies, hasAuthority } from '@/lib/utils';

const hideNavInRoutes: string[] = [
    '/admin/auth/login',
    '/admin/viewer',
    '/admin/editor',
    '/admin/logout'
];

const FilesButton: React.FC = () => {
    const t = useTranslations('Admin.Layout');
    const { selectFile } = useFileSelector();

    const onClick = React.useCallback(() => selectFile('none').catch(() => null), [selectFile]);

    return (
        <SidebarMenuButton onClick={ onClick  } isActive={ false }>
            { t('files') }
        </SidebarMenuButton>
    );
};

const Navbar: React.FC<React.PropsWithChildren> = ({ children }) => {
    const t = useTranslations('Admin.Layout');
    const [ pathname ] = usePathname().split('?');
    const { plugins } = usePlugins();
    const [ darkMode, setDarkMode ] = React.useState<boolean>(false);
    const { data } = useSession();

    const pages = React.useMemo(() => {
        let pages: Record<string, Record<string, string> | string> = {
            [ t('nav.home') ]: '/admin/home',
            [ t('nav.components') ]: {
                [ t('nav.headers') ]: '/admin/components/header',
                [ t('nav.pages') ]: '/admin/components/page',
                [ t('nav.footers') ]: '/admin/components/footer',
                [ t('nav.componentsSub') ]: '/admin/components/component'
            },
            [ t('nav.variables') ]: '/admin/variables',
            [ t('nav.users') ]: '/admin/users',
            [ t('nav.plugins') ]: {
                [ t('nav.installedPlugins') ]: '/admin/plugins',
                [ t('nav.marketplace') ]: '/admin/plugins/marketplace'
            },
            [ t('nav.themes') ]: '/admin/themes'
        };

        if (!(data?.user.role && hasAuthority(data.user.role, 'admin', 0)))
            delete pages[ t('nav.plugins') ];

        return pages;
    }, [ data, t ]);
    
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
    
    return (
        <SidebarProvider>
            <Sidebar className='dark:bg-accent'>
                <SidebarHeader className='flex flex-row items-center gap-2'>
                    <h1 className='font-bold text-2xl grow text-center'>SeraphimCMS</h1>
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
                                                { t('pluginsPages') }
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
                                { darkMode ? t('darkMode') : t('lightMode') }
                            </Label>
                        </div>
                </SidebarContent>
                <SidebarRail />
            </Sidebar>
            <SidebarInset>
                { children }
            </SidebarInset>
        </SidebarProvider>
    );
};

const Layout: NextComponentType<NextPageContext, unknown, LayoutProps<'/admin'>> = ({
    children
}) => {
    const [ pathname, stringParams ] = usePathname().split('?');    
    const urlParams = React.useMemo(() =>
        new URLSearchParams(stringParams),
        [ stringParams ]
    );

    return (
        <SessionProvider>
            <DialogProvider>
                <FileSelectorProvider>
                    <ThemesProvider>
                        {
                            hideNavInRoutes.some(v => pathname.startsWith(v)) || urlParams.get('showSidebar') === 'false'
                            ?   children
                            :   <Navbar>{ children }</Navbar>
                        }
                    </ThemesProvider>
                </FileSelectorProvider>
            </DialogProvider>
        </SessionProvider>
    );
};

export default Layout;