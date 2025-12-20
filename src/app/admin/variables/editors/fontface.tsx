'use client';
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useFileSelector } from '@/contexts/file';

type Props = {
    config: config;
    setConfig: React.Dispatch<React.SetStateAction<config>>;
};

const FontfaceEditor: React.FC<Props> = ({ config, setConfig }) => {
    const { selectFile } = useFileSelector();
    const [ newFont, setNewFont ] = React.useState({ family: '', url: '' });
    const [ fileSelectorOpen, setFileSelectorOpen ] = React.useState<boolean>(false);
    const [ popoverOpen, setPopoverOpen ] = React.useState<boolean>(false);

    const handleAddFont = () => {
        if (!newFont.family || !newFont.url) return;
        setConfig(prev => ({ ...prev, fonts: [ ...prev.fonts, newFont ] }));
        setNewFont({ family: '', url: '' });
    };

    const handleRemoveFont = (index: number) =>
        setConfig(prev => ({ ...prev, fonts: prev.fonts.filter((_, i) => i !== index) }));

    const onSelectFile = React.useCallback(() => {
        selectFile('single', 'font')
            .then(([ { pathname } ]) => {
                setNewFont(state => ({ ...state, url: pathname }));
                setFileSelectorOpen(false);
                setPopoverOpen(true);
            })
            .catch(() => {
                setFileSelectorOpen(false);
                setPopoverOpen(true);
            });
    }, []);

    return (
        <section className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h2 className='text-xl font-bold h-min'>Font Families</h2>
                <Popover open={ popoverOpen || fileSelectorOpen } onOpenChange={ setPopoverOpen }>
                    <PopoverTrigger asChild>
                        <Button variant='outline' size='icon'><Plus /></Button>
                    </PopoverTrigger>
                    <PopoverContent align='end' className='grid grid-cols-[auto_1fr] gap-2 gap-x-4 p-4 z-48'>
                        <Label htmlFor='input-fontface-family'>Family</Label>
                        <Input
                            id='input-fontface-family'
                            placeholder='e.g., Inter'
                            defaultValue={ newFont.family }
                            onChange={ ({ target: { value: family } }) => setNewFont({ ...newFont, family }) }
                        />
                        <Label htmlFor='input-fontface-url'>URL</Label>
                        <div className='flex gap-2'>
                            <Input
                                id='input-fontface-url'
                                placeholder='/fonts/inter.woff2'
                                defaultValue={ newFont.url }
                                onChange={ ({ target: { value: url } }) => setNewFont({ ...newFont, url }) }
                            />
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={ onSelectFile }
                            ><Plus /></Button>
                        </div>
                        <Button
                            variant='outline'
                            className='col-span-full'
                            onClick={ handleAddFont }
                        >Add</Button>
                    </PopoverContent>
                </Popover>
            </div>
            { config.fonts.map((font, index) => (
                <div key={ font.family } className='flex items-center'>
                    <div className='flex-1 space-y-1'>
                        <p className='text-sm font-medium'>{ font.family }</p>
                        <p className='text-xs text-muted-foreground truncate'>{ font.url }</p>
                    </div>
                    <Button variant='outline' size='icon' onClick={() => handleRemoveFont(index)}>
                        <Trash2 />
                    </Button>
                </div>
            )) }
        </section>
    );
};

export default FontfaceEditor;