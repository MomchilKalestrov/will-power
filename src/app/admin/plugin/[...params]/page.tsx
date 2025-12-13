'use client';
import React from 'react';
import { NextPage } from 'next';
import { notFound, usePathname, useRouter } from 'next/navigation';

import { usePlugins } from '@/contexts/plugins';

const Page: NextPage<PageProps<'/admin/plugin/[...params]'>> = ({ params: slugs }) => {
    const { params: [ page, ...params ] } = React.use(slugs);
    const { plugins } = usePlugins();
    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        if (!pathname.includes('showSidebar'))
            router.push(`${ pathname }${ pathname.includes('?') ? '&' : '?' }showSidebar=${ Page.showSidebar }`);
    }, [ pathname, router ]);
    
    type clusterfuck = Exclude<ReturnType<ReturnType<typeof plugins.values>[ 'toArray' ]>[ number ][ 'pages' ], undefined>[ number ] & { Component: (...params: any) => React.JSX.Element };

    const Page =
        [...plugins.values()]
            .map(plugin => plugin.pages)
            .flat()
            .filter(Boolean)
            .find(({ name }: any) => name === page) as clusterfuck;
    
    if (!Page) return notFound();

    return (<Page.Component params={ params } />);
};

export default Page;