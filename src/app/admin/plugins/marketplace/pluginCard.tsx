'use client';
import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Download, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
    
import { useDialog } from '@/contexts/dialog';
import { usePlugins } from '@/contexts/plugins';

import { getPlugins } from '@/lib/actions/marketplace';

type strippedPlugin = (Awaited<ReturnType<typeof getPlugins>> & { success: true; })[ 'value' ][ number ];

type Props = {
    plugin: strippedPlugin;
};

const PluginCard: React.FC<Props> = ({ plugin }) => {
    const { showDialog } = useDialog();
    const { addPlugin } = usePlugins();

    const installPlugin = React.useCallback((url: string) => {
        fetch(url)
            .then(async response => {
                const blob = await response.blob();
                const toastText = await addPlugin(blob);
                toast(toastText);
            })
            .catch(() => toast('Failed to install the plugin.'));
    }, []);

    const onInstallRequest = React.useCallback(() => {
        showDialog(
            'Confirm',
            `Are you sure you want to install "${ plugin.name }"?`,
            [
                { text: 'No', variant: 'default' },
                { text: 'Yes', variant: 'outline' }
            ]
        )
            .then(value => value === 'Yes' && installPlugin(plugin.downloadUrl))
            .catch(() => null);
    }, [ plugin ]);
    
    return (
        <Card className='w-full max-w-72'>
            <CardContent className='grid grid-cols-[auto_1fr_auto] grid-rows-2 gap-2 items-center'>
                <img
                    src={ plugin.iconUrl }
                    alt='icon'
                    className='row-span-2 size-20'
                />
                <p className='font-bold self-end text-lg'>{ plugin.name }</p>
                <Button
                    variant='outline'
                    size='icon'
                    onClick={ onInstallRequest }
                ><Download /></Button>
                <p className='opacity-50 self-start'>{ plugin.version }</p>
                <Button
                    variant='outline'
                    size='icon'
                >
                    <Link href={ `/admin/plugins/marketplace/plugin/${ encodeURIComponent(plugin.name) }` }>
                        <ExternalLink />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};

export default PluginCard;