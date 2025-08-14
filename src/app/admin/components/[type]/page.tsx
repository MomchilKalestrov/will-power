'use client';
import React from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { get, set } from 'idb-keyval';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

import { getAllComponents, deleteComponent } from '@/lib/db/actions';
import { Card, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import screenshot from '@/lib/screenshot';

import CreatePageDialog from './createComponentDialog';
import headerFallback from './header.png';
import pageFallback from './page.png';
import footerFallback from './footer.png';
import componentFallback from './component.png';

const fallbacks: Record<componentType, typeof pageFallback> = {
    'header': headerFallback,
    'page': pageFallback,
    'footer': footerFallback,
    'component': componentFallback
};


type ComponentCardProps = {
    name: string;
    removeComponent: (name: string) => void;
};

const ComponentCard: React.FC<ComponentCardProps> = ({
    name,
    removeComponent
}) => {
    const { type }: { type: componentType; } = useParams();
    const [ preview, setPreview ] = React.useState<typeof pageFallback | string>(fallbacks[ type ]);

    const createPreview = React.useCallback(() => {
        screenshot(name)
            .then((value: Blob) => {
                set(`preview-${ name }`, value);
                setPreview(URL.createObjectURL(value));
            });
    }, [ name ]);

    React.useEffect(() => {
        get(`preview-${ name }`)
            .then((value: Blob | undefined) => {
                if (!value) return createPreview();

                let timestamp: string | null = localStorage.getItem('screenshot-timestamp'); 
                if (!timestamp)
                    localStorage.setItem('screenshot-timestamp', Date.now().toString());
                else if (Date.now() - Number(timestamp) < 1000 * 60 * 60 * 24 * 7)
                    return createPreview();

                setPreview(URL.createObjectURL(value));
            });
    }, [ name, type ]);

    console.log(name, preview);
    
    const onDelete = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        
        const button = event.target as HTMLButtonElement | null;
        if (!button) return;
        button.disabled = true;

        deleteComponent(name).then((success) => {
            button.disabled = false;
            if (!success)
                return toast(`Failed deleting the ${ type }.`);
            removeComponent(name);
        })
    }, [ name, type ]);

    return (
        <Card className='p-0 gap-0 basis-64 grow max-w-96 text-center'>
            <Image
                width={ 384 }
                height={ 216 }
                alt='fallback'
                src={ preview }
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
                <ComponentCard
                    key={ component }
                    name={ component }
                    removeComponent={ (name) => setComponents(components.filter((component) => component !== name)) }
                />
            )) }
            <CreatePageDialog components={ components } type={ type } />
        </section>
    )
};

export default Page;