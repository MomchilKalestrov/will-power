'use client';
import React from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import { getAllPages, deletePage } from '@/lib/db/actions';
import { Card, CardFooter } from '@/components/ui/card';
import fallback from './fallback.png';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CreatePageDialog from './createPageDialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';


const PageCard: React.FC<{ name: string, removePage: (name: string) => void }> = ({ name, removePage }) => {
    const onDelete = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        
        const button = event.target as HTMLButtonElement | null;
        if (!button) return;
        button.disabled = true;

        deletePage(name).then((success) => {
            button.disabled = false;
            if (!success)
                return toast('Failed deleting the page.');
            
            deletePage(name);
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
    const [ pages, setPages ] = React.useState<string[]>([]);

    React.useEffect(() => {
        getAllPages().then(setPages);
    }, []);

    return (
        <section className='flex gap-2 flex-wrap justify-center'>
            { pages.map((page) => (
                <PageCard
                    key={ page }
                    name={ page }
                    removePage={ (name) => setPages(pages.filter((page) => page !== name)) }
                />
            )) }
            <CreatePageDialog pages={ pages } />
        </section>
    )
};

export default Page;