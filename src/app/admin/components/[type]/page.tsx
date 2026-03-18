
import type { NextPage } from 'next';
import { notFound } from 'next/navigation';
import { ServerCrash } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getAllComponents } from '@/lib/db/actions/component';

import Client from './client';


const Page: NextPage<PageProps<'/admin/components/[type]'>> = async ({ params }) => {
    const { type } = await params as { type: componentType };
    
    if (![ 'header', 'page', 'footer', 'component' ].includes(type))
        return notFound();

    const t = await getTranslations('Admin.Components');
    const response = await getAllComponents(type);

    if (!response.success)
        return (
            <div className='w-full h-full flex justify-center items-center flex-col opacity-30'>
                <ServerCrash className='size-27' />
                <p className='text-xl'>{ t('failedFetch', { type }) }</p>
            </div>
        );

    return (<Client initialComponents={ response.value } />);
};

export default Page;