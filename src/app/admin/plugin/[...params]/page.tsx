'use client';
import React from 'react';
import { NextPage } from 'next';
import { Bug } from 'lucide-react';
import { notFound, usePathname, useRouter } from 'next/navigation';

import ErrorBoundary from '@/components/errorBoundary';

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

    return (
        <ErrorBoundary fallback={ error => (
            <div className='w-full h-full flex justify-center items-center flex-col opacity-30 text-xl text-center'>
                <Bug className='size-27' />
                <p>
                    An unhandled error prevented the page to load:
                </p>
                <span className='font-mono my-2'>{ error.toString() }</span>
                <p>
                    This could be caused by an outdated version
                    or an issue caused by a different plugin.
                </p>
            </div>
        ) }>
            <Page.Component params={ params } />
        </ErrorBoundary>
    );
};

export default Page;