'use client';
import React from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

import { usePlugins } from '@/components/pluginsProvider';

import { plugin } from '@/lib/config';

import defaultPluginThumbnail from './defaultPlugin.png';

const PluginCard: React.FC<{ plugin: plugin }> = ({ plugin }) => {
    const { togglePlugin, removePlugin } = usePlugins();
    console.log(plugin);

    const onToggle = React.useCallback(async () => {
        if (!togglePlugin) return;

        const response = await togglePlugin(plugin.name);
        toast(response);
    }, [ togglePlugin, plugin ]);

    const onDelete = React.useCallback(async () => {
        if (!removePlugin) return;
        
        const response = await removePlugin(plugin.name);
        toast(response);
    }, [ removePlugin, plugin ]);

    return (
        <Card className='py-0 overflow-hidden basis-64 grow max-w-96 gap-0 relative'>
            <CardHeader
                className='p-4 relative aspect-video'
                style={ {
                    backgroundImage: `url("${ process.env.NEXT_PUBLIC_BLOB_URL }/plugins/${ plugin.name }/thumbnail.png"), url(${ defaultPluginThumbnail.src })`
                } }
            >
            </CardHeader>
            <CardContent className='p-4 flex justify-between items-center gap-2'>
                <p className='font-medium text-lg grow'>{ plugin.name }</p>
                <Switch checked={ plugin.enabled } onClick={ onToggle } />
                <Button
                    variant='destructive'
                    size='icon'
                    onClick={ onDelete }
                ><Trash2 /></Button>
            </CardContent>
        </Card>
    );
};

export default PluginCard;