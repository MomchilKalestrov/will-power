'use client';
import React from 'react';
import { toast } from 'sonner';
import { NextPage } from 'next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';

import { getPlugins } from '@/lib/actions';

import PluginCard from './pluginCard';

type strippedPlugins = (Awaited<ReturnType<typeof getPlugins>> & { success: true; })[ 'value' ];

const PLUGIN_COUNT_PER_PAGE = 10;

const Page: NextPage = () => {
    const [ page, setPage ] = React.useState<number>(0);
    const [ plugins, setPlugins ] = React.useState<strippedPlugins>([]);

    const onFetchedPlugins = React.useCallback((response: Awaited<ReturnType<typeof getPlugins>>) =>
        !response.success
        ?   toast('Failed to load the marketplace: ' + response.reason)
        :   setPlugins(response.value)
    , []);

    React.useEffect(() => {
        getPlugins(page, 10).then(onFetchedPlugins);
    }, [ page ]);

    return (
        <div className='h-[calc(100dvh-var(--spacing)*16)] p-8 box-border grid grid-rows-[1fr_auto] gap-8'>
            <div className='w-full flex flex-wrap gap-4 items-start content-start overflow-scroll'>
                { plugins.map(plugin => (
                    <PluginCard plugin={ plugin } key={ plugin.name } />
                )) }
            </div>
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
        </div>
    );
};

export default Page;