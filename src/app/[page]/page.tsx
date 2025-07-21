'use server';
import React from 'react';
import { NextPage } from 'next';
import { notFound } from 'next/navigation';
import RenderNode from '@/components/renderNode';
import { getPageByName } from '@/lib/db/actions';

type Props = {
    params: Promise<{ page: string }>
};

const Page: NextPage<Props> = async ({ params }) => {
    const { page: pageName } = await params;
    const page = await getPageByName(pageName);
    
    return page ? <RenderNode node={ page.rootNode } /> : notFound();
};

export default Page;