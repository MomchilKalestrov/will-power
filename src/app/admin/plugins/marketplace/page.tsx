'use client';
import React from 'react';
import { toast } from 'sonner';
import { NextPage } from 'next';
import { ChevronLeft, ChevronRight, Search, ServerCrash } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ButtonGroup } from '@/components/ui/button-group';

import { getPlugins, getPluginsByQuery } from '@/lib/actions';

import PluginCard from './pluginCard';

type strippedPlugins = (Awaited<ReturnType<typeof getPlugins>> & { success: true; })[ 'value' ];
        
const PLUGIN_COUNT_PER_PAGE = 10;

const Page: NextPage = () => {
    const [ page, setPage ] = React.useState<number>(0);
    const [ plugins, setPlugins ] = React.useState<strippedPlugins | undefined | null>(undefined);
    const [ query, setQuery ] = React.useState<string>('');

    const onSearch = React.useCallback(() => {
        const backupPlugins = JSON.parse(JSON.stringify(plugins)) satisfies typeof plugins;
        setPlugins(undefined);

        getPluginsByQuery(query, 0, PLUGIN_COUNT_PER_PAGE)
            .then(response => {
                if (!response.success) {
                    toast('Failed to query the plugins: ' + response.reason);
                    setPlugins(backupPlugins);
                    return;
                };

                setPage(0);
                setPlugins(response.value);
            });
    }, [ query, plugins ]);

    React.useEffect(() => {
        getPlugins(page, PLUGIN_COUNT_PER_PAGE)
            .then(response => {
                if (response.success)
                    return setPlugins(response.value);

                toast('Failed to load the plugins: ' + response.reason);
                setPlugins(null);
            });
    }, [ page ]);

    if (plugins === null)
        return (
            <div className='h-[calc(100dvh-var(--spacing)*16)] flex justify-center items-center flex-col opacity-30'>
                <ServerCrash className='size-27' />
                <p className='text-xl'>Failed to connect to marketplace...</p>
            </div>
        );

    if (!plugins)
        return (
            <div className='h-[calc(100dvh-var(--spacing)*16)] p-8 box-border flex justify-center items-center'>
                <Spinner className='size-9 opacity-50' />
            </div>
        );

    return (
        <div className='h-[calc(100dvh-var(--spacing)*16)] p-8 box-border grid grid-rows-[1fr_auto] gap-8'>
            <div className='w-full flex flex-wrap gap-4 items-start content-start overflow-scroll'>
                { plugins.map(plugin => (
                    <PluginCard plugin={ plugin } key={ plugin.name } />
                )) }
            </div>
            <div className='flex justify-between gap-2'>
                <ButtonGroup orientation='horizontal'>
                    <Button
                        size='icon'
                        variant='outline'
                        onClick={ () => setPage(state => Math.max(state - 1, 0)) }
                        disabled={ page === 0 }
                    ><ChevronLeft /></Button>
                    <Button
                        size='icon'
                        variant='ghost'
                        disabled
                    >{ page + 1 }</Button>
                    <Button
                        size='icon'
                        variant='outline'
                        onClick={ () => setPage(state => Math.max(state - 1, 0)) }
                        disabled={ plugins.length !== PLUGIN_COUNT_PER_PAGE }
                    ><ChevronRight /></Button>
                </ButtonGroup>
                <div className='flex gap-2'>
                    <Input
                        value={ query }
                        onChange={ ({ currentTarget: { value } }) => setQuery(value) }
                        placeholder='Seach...'
                    />
                    <Button
                        size='icon'
                        onClick={ onSearch }
                    ><Search className='rotate-y-180' /></Button>
                </div>
            </div>
        </div>
    );
};

export default Page;