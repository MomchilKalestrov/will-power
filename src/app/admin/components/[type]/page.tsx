'use client';
import React from 'react';
import type { NextPage } from 'next';

import { getAllComponents } from '@/lib/db/actions';

import ComponentCard from './componentCard';
import CreatePageDialog from './createComponentDialog';

const Page: NextPage<PageProps<'/admin/components/[type]'>> = ({ params }) => {
    const { type } = React.use(params) as { type: componentType };
    const [ components, setComponents ] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (!type) return;
        getAllComponents(type)
            .then(setComponents);
    }, [ type ]);

    return (
        <main className='flex gap-2 flex-wrap justify-center p-8'>
            { components.map(component => (
                <ComponentCard
                    key={ component }
                    name={ component }
                    removeComponent={ name => setComponents(components.filter(component => component !== name)) }
                />
            )) }
            <CreatePageDialog components={ components } type={ type } />
        </main>
    )
};

export default Page;