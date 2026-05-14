'use client';
import React from 'react';
import Image from 'next/image';
import { Rat } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Card, CardFooter } from '@/components/ui/card';

import Portal from '@/components/portal';
import PathBreadcumbs from '@/components/pathBreadcrumbs';

import { pathListToTree, type fileNode } from '@/lib/utils';

import folder from './folder.svg';
import ComponentCard from './componentCard';
import CreateComponentDialog from './createComponentDialog';

type Props = {
    initialComponents: string[];
};

const Client: React.FC<Props> = ({ initialComponents }) => {
    const t = useTranslations('Admin.Components');
    const { type }: { type: componentType; } = useParams();
    const [ components, setComponents ] = React.useState<string[]>(initialComponents);
    
    const [ cwd, setCwd ] = React.useState<string[]>([]);
    const tree = React.useMemo(() => pathListToTree(components), [ components ]);
    
    let directoryNode: fileNode | undefined = tree;
    loop: for (let i = 0; i < cwd.length; i++) {
        if (!directoryNode?.children![ cwd[ i ] ]) {
            setCwd(state => state.slice(0, i));
            break loop;
        };
        directoryNode = directoryNode?.children![ cwd[ i ] ];
    };

    if (components.length === 0)
        return (
            <div className='w-full h-[calc(100dvh-var(--spacing)*16)] flex justify-center items-center flex-col opacity-30'>
                <Rat className='size-27' />
                <p className='text-xl'>{ t('noComponents', { type }) }</p>
                <Portal parent='components-portal'>
                    <CreateComponentDialog
                        prefix={ cwd.join('/') }
                        components={ components }
                        type={ type }
                    />
                </Portal>
            </div>
        );

    return (
        <main className='flex gap-2 flex-wrap justify-center content-start items-start overflow-y-scroll p-8 h-[calc(100dvh-var(--spacing)*16)]'>
            {
                Object
                    .entries(directoryNode.children ?? {})
                    .sort(([ _, a ], [ __, b ]) => (a.isFile ? 1 : -1) - (b.isFile ? 1 : -1))
                    .map(([ component, { isFile } ]) => (
                isFile
                ?   <ComponentCard
                        key={ component }
                        name={ [ ...cwd, component ].join('/') }
                        removeComponent={ name => setComponents(components.filter(component => component !== name)) }
                    />
                :   <Card
                        key={ component }
                        className='p-0 gap-0 basis-64 grow max-w-96 text-center'
                        onClick={ () => setCwd(state => [ ...state, component ]) }
                    >
                        <Image
                            width={ 384 }
                            height={ 216 }
                            alt='fallback'
                            src={ folder }
                            priority={ true }
                            className='w-full rounded-xl dark:invert'
                        />
                        <CardFooter className='p-4 flex gap-2 items-center h-17'>
                            <p className='font-medium text-lg grow text-center'>{ component.split('/').pop() }</p>
                        </CardFooter>
                    </Card>
            )) }
            {
                type === 'page' &&
                <Portal parent='components-portal-cwd'>
                    <PathBreadcumbs paths={ [ 'root', ...cwd ] } onClick={ (_, index) => setCwd(state => state.slice(0, index !== 0 ? index + 1 : 0)) } />    
                </Portal>
            }
            <Portal parent='components-portal'>
                <CreateComponentDialog
                    prefix={ cwd.join('/') }
                    components={ components }
                    type={ type }
                />
            </Portal>
        </main>
    );
};

export default Client;