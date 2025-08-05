'use client';
import React from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import { getAllComponents, deleteComponent } from '@/lib/db/actions';
import { Card, CardFooter } from '@/components/ui/card';
import fallback from './fallback.png';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CreatePageDialog from './createPageDialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';


const PageCard: React.FC<{ name: string, removePage: (name: string) => void }> = ({ name, removePage }) => {
    const onDelete = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        
        const button = event.target as HTMLButtonElement | null;
        if (!button) return;
        button.disabled = true;

        deleteComponent(name).then((success) => {
            button.disabled = false;
            if (!success)
                return toast('Failed deleting the page.');
            removePage(name);
        })
    }, [ name ]);

    return (
        <Card className='p-0 gap-0 basis-64 grow max-w-96 text-center'>
            <Image
                width={ 384 }
                height={ 216 }
                alt='fallback'
                src={ fallback }
                priority={ true }
                className='w-full rounded-xl'
            />
            <CardFooter className='p-4 flex gap-2 justify-between items-center'>
                <p className='font-medium text-lg grow text-left'>{ name }</p>
                <Button variant='outline'>
                    <Link href={ '/admin/editor/' + name }>Edit</Link>
                </Button>
                <Button
                    variant='destructive'
                    size='icon'
                    onClick={ onDelete }
                >
                    <Trash2 />
                </Button>
            </CardFooter>
        </Card>
    );
};

const Page: NextPage = () => {
    const { type }: { type: componentType; } = useParams();
    const [ components, setComponents ] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (!type) return;
        getAllComponents(type).then(setComponents);
    }, [ type ]);

    return (
        <section className='flex gap-2 flex-wrap justify-center'>
            { components.map((component) => (
                <PageCard
                    key={ component }
                    name={ component }
                    removePage={ (name) => setComponents(components.filter((component) => component !== name)) }
                />
            )) }
            <CreatePageDialog components={ components } type={ type } />
        </section>
    )
};

export default Page;