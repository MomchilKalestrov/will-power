'use client';
import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { NextPage } from 'next';
import { Verified } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';

import { getAuthor } from '@/lib/actions';

type author = (Awaited<ReturnType<typeof getAuthor>> & { success: true; })[ 'value' ];

const Page: NextPage<PageProps<'/admin/plugins/marketplace/author/[name]'>> = ({ params }) => {
    const { name } = React.use(params);
    const [ author, setAuthor ] = React.useState<author | undefined>();

    React.useEffect(() =>
        void getAuthor(decodeURIComponent(name))
            .then(response =>
                !response.success
                ?   toast('Failed to load the author: ' + response.reason)
                :   setAuthor(response.value)
            ),
        [ name ]
    );

    if (author === undefined)
        return (
            <div className='h-[calc(100dvh-var(--spacing)*16)] p-8 box-border flex justify-center items-center'>
                <Spinner className='size-9 opacity-50' />
            </div>
        );

    return (
        <div className='h-[calc(100dvh-var(--spacing)*16)] p-8 box-border'>
            <header className='grid grid-cols-[auto_1fr_auto] gap-2'>
                <img src={ author.pictureUrl } alt={ `${ author.name } profile` } className='size-18 row-span-full' />
                <div className='flex flex-col justify-center'>
                    <h3 className='font-bold text-3xl'>{ author.name }</h3>
                    {
                        author.verified &&
                        <p className='opacity-50 text-sm flex gap-1'>
                            <Verified className='size-5' />
                            Verified
                        </p>
                    }
                    
                </div>
            </header>
            <Separator className='my-4' />
            <h4 className='font-bold text-2xl'>Plugins</h4>
            { author.plugins.map(plugin => (
                <Link
                    key={ plugin }
                    href={ `/admin/plugins/marketplace/plugin/${ encodeURI(plugin) }` }
                    className='underline'
                >{ plugin }</Link>
            )) }
        </div>
    );
};

export default Page;