'use client';
import React from 'react';
import { Metadata, NextPage } from 'next';

import { usePlugins } from '@/components/pluginsProvider';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Plugin Page'
};

const Page: NextPage<PageProps<'/admin/plugin/[...params]'>> = ({ params: slugs }) => {
    const { params: [ page, ...params ] } = React.use(slugs);
    const { plugins } = usePlugins();
    const Page = [ ...plugins.values() ].map(p => p.components).flat().find(c => c.metadata.name === page);
    if (!Page) return notFound();

    return (
        <Page.Component params={ params } />
    );
};

export default Page;