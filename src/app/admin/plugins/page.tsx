'use client';
import React from 'react';
import { NextPage } from 'next';
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';

import { usePlugins } from '@/components/pluginsProvider';

import { plugin } from '@/lib/config';

import defaultPluginThumbnail from './defaultPlugin.png';

// Oct 21 17:02:29
// I am back to feeling soulless. Well, I do have feelings.
// just that they are pain and sadness.
// 
// I felt embarrassed today. Aparently (they) told me they
// liked me just to comfirm a suspicion of theirs. Why??
// It's abundantly clear I do have a crush on them, so why
// the damn hastle? It was dehumanizing. Even more so that
// they think it's just "bothering me". It wasn't. It was
// eating at me. The whole damn weekend. I couldn't focus
// on my russian lessons. Just thinking about whether they
// were serious or not. Only to come to the conclusion that
// it wasn't and joke and then be told "No, I just wanted
// to comfim a theory about you".
// 
// I had to cross the boulevard to get to the bank today.
// While I was waiting for the light to turn green, I just
// looked at the cars and wondered whether they were
// going fast enough to end my sufferring.
// 
// As much as I wish I could pretend I'm fine, I just can't.
// This is something I'm simply unable to shrug off. I can
// understand that they aren't interested in a relationship,
// but I can't grasp the fact that they would do something
// so fucked up.
// 
// I hope I can forgive them, but as much as I love them,
// I might need to force myself not to just out of self
// respect.
// 
// So far for "you can never do me any wrong"...

const PluginCard: React.FC<{ plugin: plugin }> = ({ plugin }) => {
    const { togglePlugin, removePlugin } = usePlugins();
    const [ isPaused, setPaused ] = React.useState<boolean>(false);
    console.log(plugin);

    const onToggle = React.useCallback(async () => {
        if (!togglePlugin) return;

        setPaused(true);

        const response = await togglePlugin(plugin.name);
        toast(response);

        setPaused(false);
    }, [ togglePlugin, plugin ]);

    const onDelete = React.useCallback(async () => {
        if (!removePlugin) return;

        setPaused(true);
        
        const response = await removePlugin(plugin.name);
        toast(response);

        setPaused(false);
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
                ><Trash2 /></Button>
            </CardContent>
            {
                isPaused &&
                <div className='absolute w-full h-full bg-background/75 flex justify-center items-center'>
                    <Spinner className='size-6' />
                </div>
            }
        </Card>
    )
};

const Page: NextPage = () => {
    const { plugins, addPlugin } = usePlugins();
    const [ file, setFile ] = React.useState<File | undefined>();
    const [ dialogOpen, setDialogOpen ] = React.useState<boolean>(false);

    const onSend = React.useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.currentTarget.disabled = true;

        const response = await addPlugin!(file!);
        toast(response);
        
        event.currentTarget.disabled = false;
        setDialogOpen(false);
    }, [ file ]);

    return (
        <div className='p-8 grid grid-rows-[min-content_auto_1fr] h-full gap-2'>
            <div>
                <Dialog open={ dialogOpen } onOpenChange={ setDialogOpen }>
                    <DialogTrigger asChild>
                        <Button variant='outline' size='icon'>
                            <PlusCircle />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload</DialogTitle>
                            <DialogDescription>
                                Select an <code>.zip</code> archive to upload as a plugin.
                                The archive must contain a <code>metadata.json</code>{ ' ' }
                                and <code>index.js</code> file inside.
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            type='file'
                            accept='.zip'
                            multiple={ false }
                            onChange={ ({ currentTarget: { files } }) =>
                                setFile([ ...files! ][ 0 ])
                            }
                        />
                        <Button
                            onClick={ onSend }
                            disabled={ !file || !addPlugin }
                            variant='outline'
                        >Upload</Button>
                    </DialogContent>
                </Dialog>
            </div>
            <div className='flex flex-wrap gap-2'>
                { plugins?.map(plugin => (<PluginCard key={ plugin.name } plugin={ plugin } />)) }
            </div>
        </div>
    );
};

export default Page;