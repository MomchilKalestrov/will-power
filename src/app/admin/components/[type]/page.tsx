
import type { NextPage } from 'next';
import { notFound } from 'next/navigation';
import { Rat, ServerCrash } from 'lucide-react';

import { getAllComponents } from '@/lib/db/actions';

import Client from './client';


const Page: NextPage<PageProps<'/admin/components/[type]'>> = async ({ params }) => {
    const { type } = await params as { type: componentType };
    
    if (![ 'header', 'page', 'footer', 'component' ].includes(type))
        return notFound();

    const response = await getAllComponents(type);

    if (!response.success)
        return (
            <div className='w-full h-full flex justify-center items-center flex-col opacity-30'>
                <ServerCrash className='size-27' />
                <p className='text-xl'>Failed to get { type }s...</p>
            </div>
        );

    if (response.value.length === 0)
        return (
            <div className='w-full h-[calc(100dvh-var(--spacing)*16)] flex justify-center items-center flex-col opacity-30'>
                <Rat className='size-27' />
                <p className='text-xl'>No { type }s here. Why don't you create one?</p>
            </div>
        );

    return (<Client initialComponents={ response.value } />);
};

export default Page;