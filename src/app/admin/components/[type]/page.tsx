'use client';
import React from 'react';
import { toast } from 'sonner';
import ReactDOM from 'react-dom';
import { Rat } from 'lucide-react';
import type { NextPage } from 'next';
import { notFound } from 'next/navigation';

import { getAllComponents } from '@/lib/db/actions';

import ComponentCard from './componentCard';
import CreateComponentDialog from './createComponentDialog';

const Page: NextPage<PageProps<'/admin/components/[type]'>> = ({ params }) => {
    const { type } = React.use(params) as { type: componentType };
    const [ components, setComponents ] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (!type) return;
        getAllComponents(type)
            .then(result => {
                if (!result.success)
                    return toast(`Failed to get ${ type }s: ` + result.reason);
                setComponents(result.value);
            });
    }, [ type ]);

    if (![ 'header', 'page', 'footer', 'component' ].includes(type))
        return notFound();

    if (components.length === 0)
        return (
            <div className='w-full h-[calc(100dvh-var(--spacing)*16)] flex justify-center items-center flex-col opacity-30'>
                <Rat className='size-27' />
                <p className='text-xl'>No { type }s here...</p>
            </div>
        );

    return (
        <main className='flex gap-2 flex-wrap justify-center content-start items-start overflow-y-scroll p-8 h-[calc(100dvh-var(--spacing)*16)]'>
            { components.map(component => (
                <ComponentCard
                    key={ component }
                    name={ component }
                    removeComponent={ name => setComponents(components.filter(component => component !== name)) }
                />
            )) }
            { ReactDOM.createPortal(
                <CreateComponentDialog components={ components } type={ type } />,
                document.getElementById('components-portal')!
            ) }
        </main>
    )
};

export default Page;