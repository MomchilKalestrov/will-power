'use client';
import React from 'react';
import { NextPage } from 'next';
import { notFound } from 'next/navigation';

import { usePlugins } from '@/components/pluginsProvider';

const Page: NextPage<PageProps<'/admin/plugin/[...params]'>> = ({ params: slugs }) => {
    const { params: [ page, ...params ] } = React.use(slugs);
    const { plugins } = usePlugins();
    const Page =
        [ ...plugins.values() ]
            .map(plugin => plugin.pages)
            .flat()
            .filter(Boolean)
            .find(({ name }: any) => name === page) as { Component: React.ComponentType<any> } | undefined;
    
    if (!Page) return notFound();

    return (<Page.Component params={ params } />);
};

export default Page;