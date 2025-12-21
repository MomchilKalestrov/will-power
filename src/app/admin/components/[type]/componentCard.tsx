'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { get, set } from 'idb-keyval';
import { Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';

import screenshot from '@/lib/screenshot';
import { cn, storage } from '@/lib/utils';

import { deleteComponent } from '@/lib/db/actions';

import headerFallback from './defaultHeader.svg';
import pageFallback from './defaultPage.svg';
import footerFallback from './defaultFooter.svg';
import componentFallback from './defaultComponent.svg';

const fallbacks: Record<componentType, typeof pageFallback> = {
    'header': headerFallback,
    'page': pageFallback,
    'footer': footerFallback,
    'component': componentFallback
};

type Props = {
    name: string;
    removeComponent: (name: string) => void;
};

const ComponentCard: React.FC<Props> = ({
    name,
    removeComponent
}) => {
    const { type }: { type: componentType; } = useParams();
    const [ preview, setPreview ] = React.useState<typeof pageFallback | string>(fallbacks[ type ]);

    const createPreview = React.useCallback(() => {
        screenshot(name)
            .then((value: string) => {
                storage.set('screenshot-timestamp', Date.now());
                set(`preview-${ name }`, value);
                setPreview(value);
            });
    }, [ name ]);

    React.useEffect(() => {
        get(`preview-${ name }`)
            .then((value: string | undefined) => {
                if (!value) return createPreview();
                
                const timestamp: string | null = storage.get('screenshot-timestamp'); 
                if (!timestamp)
                    storage.set('screenshot-timestamp', Date.now());
                else if (Date.now() - Number(timestamp) > 1000 * 60 * 60 * 24 * 7)
                    return createPreview();
                
                setPreview(value);
            });
    }, [ name, type ]);
    
    const onDelete = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        
        const button = event.currentTarget satisfies HTMLButtonElement;

        button.disabled = true;

        deleteComponent(name)
            .then(response => {
                button.disabled = false;
                if (!response.success)
                    return toast(`Failed to delete the ${ type }: ` + response.reason);
                removeComponent(name);
            });
    }, [ name, type ]);

    const hasFilter = preview === fallbacks[ type ];

    return (
        <Card className='p-0 gap-0 basis-64 grow max-w-96 text-center'>
            <Image
                width={ 384 }
                height={ 216 }
                alt='fallback'
                src={ preview }
                priority={ true }
                className={ cn('w-full rounded-xl', hasFilter && 'dark:invert') }
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
                ><Trash2 /></Button>
            </CardFooter>
        </Card>
    );
};

export default ComponentCard;