'use client';
import React from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

import { useThemes } from '@/components/themesProvider';

import defaultPluginThumbnail from './defaultTheme.png';

const ThemeCard: React.FC<{ theme: string }> = ({ theme }) => {
    const { theme: currentTheme, selectTheme, removeTheme } = useThemes();

    const onSelect = React.useCallback(async () => {
        if (currentTheme === theme) return;
        const response = await selectTheme(theme);
        toast(response);
    }, [ selectTheme, theme, currentTheme ]);

    const onDelete = React.useCallback(async () => {
        const response = await removeTheme(theme);
        toast(response);
    }, [ removeTheme, theme ]);

    return (
        <Card className='py-0 overflow-hidden basis-64 grow max-w-96 gap-0 relative'>
            <CardHeader
                className='p-4 relative aspect-video bg-size-[100%] rounded-xl'
                style={ {
                    backgroundImage: `url("${ process.env.NEXT_PUBLIC_BLOB_URL }/themes/${ theme }/thumbnail.png"), url(${ defaultPluginThumbnail.src })`
                } }
            >
            </CardHeader>
            <CardContent className='p-4 flex justify-between items-center gap-2'>
                <p className='font-medium text-lg grow'>{ theme }</p>
                <Switch checked={ currentTheme === theme } onClick={ onSelect } />
                {
                    theme !== 'default' &&
                    <Button
                        variant='destructive'
                        size='icon'
                        onClick={ onDelete }
                    ><Trash2 /></Button>
                }
            </CardContent>
        </Card>
    );
};

export default ThemeCard;