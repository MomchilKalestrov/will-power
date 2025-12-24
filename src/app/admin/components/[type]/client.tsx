'use client';
import React from 'react';
import ReactDOM from 'react-dom';
import { Rat } from 'lucide-react';
import { useParams } from 'next/navigation';

import ComponentCard from './componentCard';
import CreateComponentDialog from './createComponentDialog';

type Props = {
    initialComponents: string[];
};

const Client: React.FC<Props> = ({ initialComponents }) => {
    const { type }: { type: componentType; } = useParams();
    const [ components, setComponents ] = React.useState<string[]>(initialComponents);
    const [ mounted, setMounted ] = React.useState<boolean>(false);

    React.useEffect(() => void setMounted(true), []);

    if (components.length === 0)
        return (
            <div className='w-full h-[calc(100dvh-var(--spacing)*16)] flex justify-center items-center flex-col opacity-30'>
                <Rat className='size-27' />
                <p className='text-xl'>No { type }s here. Why don't you create one?</p>
                {
                    mounted &&
                    ReactDOM.createPortal(
                        <CreateComponentDialog components={ components } type={ type } />,
                        document.getElementById('components-portal')!
                    )
                }
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
            {
                mounted &&
                ReactDOM.createPortal(
                    <CreateComponentDialog components={ components } type={ type } />,
                    document.getElementById('components-portal')!
                )
            }
        </main>
    );
};

export default Client;