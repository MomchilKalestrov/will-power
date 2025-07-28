'use client';
import React from 'react';
import type { config } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import ColorPicker from '@/components/inputs/colorPicker';
import { useConfig } from '@/components/configProvider';

type Props = {
    initialConfig: config;
};

const Editor: React.FC<Props> = ({ initialConfig }) => {
    const { updateConfig } = useConfig();
    const [ config, setConfig ] = React.useState<config>(initialConfig);

    const editorParams = { config, setConfig: (i: any) => {
        console.log(i);
        setConfig(i);
    } };

    return (
        <>
            <header className='h-16 w-full px-4 border-b bg-background flex justify-between items-center gap-4 shrink-0'>
                <div />
                <section className='flex gap-2'>
                    <Button variant='outline' onClick={ () => setConfig(initialConfig) }>
                        Reset
                    </Button>
                    <Button onClick={ () => updateConfig?.(config) }>
                        Save
                    </Button>
                </section>
            </header>
            <main className='flex h-[calc(100dvh_-_var(--spacing)_*_16)]'>
                <Card className='min-w-32 max-w-[33%] overflow-hidden resize-x h-full rounded-none border-0 border-r p-4'>
                    <div className='space-y-4'>
                        <ColorEditor { ...editorParams } />
                        <Separator />
                        <FontEditor { ...editorParams } />
                    </div>
                </Card>

                {/* Right Panel: Visualization */}
                <section className='flex-1 p-8 overflow-y-auto'>
                    <div className='max-w-4xl mx-auto'>
                        <h2 className='text-3xl font-bold mb-6'>Preview</h2>
                        <Separator className='my-8' />
                        <ColorPreview config={config} />
                        <Separator className='my-8' />
                        <FontPreview config={config} />
                    </div>
                </section>
            </main>
        </>
    );
};

const ColorEditor: React.FC<{ config: config, setConfig: React.Dispatch<React.SetStateAction<config>> }> = ({ config, setConfig }) => {
    const [ newColor, setNewColor ] = React.useState({ name: '', color: '#000000' });

    const handleAddColor = () => {
        if (!newColor.name || !newColor.color) return;
        setConfig(prev => ({
            ...prev,
            variables: [
                ...prev.variables,
                {
                    id: crypto.randomUUID(),
                    type: 'color',
                    name: newColor.name,
                    color: newColor.color as `#${string}`
                }
            ]
        }));
        setNewColor({ name: '', color: '#000000' });
    };

    const handleRemoveColor = (id: string) => {
        setConfig(prev => ({
            ...prev,
            variables: prev.variables.filter(v => v.id !== id)
        }));
    };

    const handleColorChange = (id: string, field: 'name' | 'color', value: string) => {
        setConfig(prev => ({
            ...prev,
            variables: prev.variables.map(v =>
                v.id === id && v.type === 'color' ? { ...v, [field]: value } : v
            )
        }));
    };

    const colorVariables = config.variables.filter(v => v.type === 'color');

    return (
        <div className='space-y-4'>
            <h3 className='text-lg font-bold'>Colors</h3>
            <Separator />
            { colorVariables.map(({ id, name, color }) => (
                <div key={ id } className='flex items-center gap-2 rounded-md'>
                    <Input
                        className='flex-1'
                        defaultValue={ name }
                        onChange={ ({ target: { value } }) => handleColorChange(id, 'name', value) }
                    />
                    <ColorPicker
                        value={ color }
                        selected={ true }
                        onChange={ (value) => handleColorChange(id, 'color', value) }
                    />
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={ () => handleRemoveColor(id) }
                    >
                        <Trash2 className='size-4' />
                    </Button>
                </div>
            )) }
            <div className='grid grid-cols-[1fr_auto] items-end gap-2 p-4 border rounded-md border-dashed'>
                <Input
                    placeholder='e.g., primary'
                    value={ newColor.name }
                    onChange={({ target: { value: name } }) => setNewColor({ ...newColor, name })}
                />
                <ColorPicker
                    value={ newColor.color }
                    selected={ true }
                    onChange={ (color) => setNewColor({ ...newColor, color }) }
                />
                <Button variant='outline' className='col-span-full' onClick={handleAddColor}>Add</Button>
            </div>
        </div>
    );
};

const FontEditor: React.FC<{ config: config, setConfig: React.Dispatch<React.SetStateAction<config>> }> = ({ config, setConfig }) => {
    const [newFont, setNewFont] = React.useState({ family: '', url: '' });

    const handleAddFont = () => {
        if (!newFont.family || !newFont.url) return;
        setConfig(prev => ({ ...prev, fonts: [...prev.fonts, newFont] }));
        setNewFont({ family: '', url: '' });
    };

    const handleRemoveFont = (index: number) => {
        setConfig(prev => ({ ...prev, fonts: prev.fonts.filter((_, i) => i !== index) }));
    };

    return (
        <Card className='border-none shadow-none'>
            <CardHeader>
                <CardTitle>Fonts</CardTitle>
                <CardDescription>Manage fonts from valid URLs (e.g., .woff2).</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                {config.fonts.map((font, index) => (
                    <div key={index} className='flex items-center gap-2 p-2 border rounded-md'>
                        <div className='flex-1 space-y-1'>
                            <p className='text-sm font-medium'>{font.family}</p>
                            <p className='text-xs text-muted-foreground truncate'>{font.url}</p>
                        </div>
                        <Button variant='ghost' size='icon' onClick={() => handleRemoveFont(index)}>
                            <Trash2 className='size-4' />
                        </Button>
                    </div>
                ))}
                <div className='flex items-end gap-2 p-2 border rounded-md border-dashed'>
                    <div className='flex-1'>
                        <Label>Font Family</Label>
                        <Input placeholder='e.g., Inter' value={newFont.family} onChange={e => setNewFont({ ...newFont, family: e.target.value })} />
                    </div>
                    <div className='flex-1'>
                        <Label>Font URL</Label>
                        <Input placeholder='/fonts/inter.woff2' value={newFont.url} onChange={e => setNewFont({ ...newFont, url: e.target.value })} />
                    </div>
                    <Button onClick={handleAddFont}>Add</Button>
                </div>
            </CardContent>
        </Card>
    );
};

const ColorPreview: React.FC<{ config: config }> = ({ config }) => {
    const colorVariables = config.variables.filter(v => v.type === 'color');
    return (
        <div>
            <h3 className='text-2xl font-semibold'>Colors</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {colorVariables.map(variable => (
                    <div key={variable.id} className='text-center'>
                        <div className='w-full aspect-video rounded-lg border shadow-sm' style={{ backgroundColor: variable.color }}></div>
                        <p className='mt-2 text-sm font-medium'>{variable.name}</p>
                        <p className='text-xs text-muted-foreground'>{variable.color}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FontPreview: React.FC<{ config: config }> = ({ config }) => {
    return (
        <div>
            <h3 className='text-2xl font-semibold mb-4'>Fonts</h3>
            <div className='space-y-6'>
                {config.fonts.map((font, index) => (
                    <div key={index}>
                        <h4 className='text-lg font-medium' style={{ fontFamily: font.family }}>{font.family}</h4>
                        <p className='text-muted-foreground text-sm' style={{ fontFamily: font.family }}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Editor;